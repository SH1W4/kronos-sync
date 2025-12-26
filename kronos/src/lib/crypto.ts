import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// In Prod, this MUST be a 32-byte hex string in env vars
// For dev, we fall back to a deterministic hash of a secret string
const SECRET_KEY = process.env.DATA_ENCRYPTION_KEY || crypto.createHash('sha256').update('kronos_dev_secret_key_2025').digest('hex').substring(0, 32);

export function encrypt(text: string): string {
    if (!text) return text;

    // IV needs to be random for every encryption
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(64);

    // Key derivation for stronger security (though we have a master key above, salt adds uniqueness)
    const key = crypto.scryptSync(SECRET_KEY, salt, 32);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Format: salt:iv:tag:encryptedData
    return [
        salt.toString('hex'),
        iv.toString('hex'),
        tag.toString('hex'),
        encrypted.toString('hex')
    ].join(':');
}

export function decrypt(text: string): string {
    if (!text) return text;
    // Check if it matches our format (has 3 colons)
    if (!text.includes(':')) return text; // Probably legacy plain text

    const parts = text.split(':');
    if (parts.length !== 4) return text; // Corrupted or old format

    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const encryptedText = Buffer.from(parts[3], 'hex');

    const key = crypto.scryptSync(SECRET_KEY, salt, 32);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    try {
        return Buffer.concat([decipher.update(encryptedText), decipher.final()]).toString('utf8');
    } catch (e) {
        console.error('Decryption failed:', e);
        return '*** DADO CRIPTOGRAFADO (ERRO DE CHAVE) ***';
    }
}
