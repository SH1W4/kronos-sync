const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceImage = path.join(__dirname, '..', 'public', 'brand', 'k_hourglass_logo.png');
const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

const targets = [
    { file: path.join(publicDir, 'icon.png'), size: 512 },
    { file: path.join(publicDir, 'apple-icon.png'), size: 192 },
    { file: path.join(iconsDir, 'icon-72x72.png'), size: 72 },
    { file: path.join(iconsDir, 'icon-96x96.png'), size: 96 },
    { file: path.join(iconsDir, 'icon-128x128.png'), size: 128 },
    { file: path.join(iconsDir, 'icon-144x144.png'), size: 144 },
    { file: path.join(iconsDir, 'icon-152x152.png'), size: 152 },
    { file: path.join(iconsDir, 'icon-192x192.png'), size: 192 },
    { file: path.join(iconsDir, 'icon-384x384.png'), size: 384 },
    { file: path.join(iconsDir, 'icon-512x512.png'), size: 512 }
];

async function generate() {
    console.log('Starting icon generation from:', sourceImage);
    for (const target of targets) {
        try {
            await sharp(sourceImage)
                .resize(target.size, target.size)
                .toFile(target.file);
            console.log(`Successfully generated: ${target.file} (${target.size}x${target.size})`);
        } catch (err) {
            console.error(`Error generating ${target.file}:`, err);
        }
    }
    console.log('All icons generated successfully!');
}

generate();
