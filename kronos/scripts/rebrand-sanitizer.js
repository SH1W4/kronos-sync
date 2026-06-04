const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TARGET_DIRS = ['src', 'docs']; // Apenas varrer os locais relevantes
const EXTENSIONS = ['.ts', '.tsx', '.md'];

// Padrões Excluídos (NÃO alterar)
const EXCLUSIONS = [
    /Kronos Tattoo Studio/gi,
    /Estúdio Kronos/gi,
    /Estudio Kronos/gi,
    /kronos_sync/gi,
    /kronos-sync/gi,
    /kronosync\.com\.br/gi, // Tratado individualmente abaixo
];

// O que fazer se encontrar uma exclusão: ignorar a linha inteira ou apenas o match?
// Abordagem mais segura: Replace controlado.

const REPLACEMENTS = [
    // Emails
    { regex: /KRONOS SYNC <acesso@kronosync\.com\.br>/g, replace: 'KAIRØS OS <acesso@kairos-os.com.br>' },
    
    // Nomes Compostos (Prioridade alta)
    { regex: /KRONOS SYNC/g, replace: 'KAIRØS OS' },
    { regex: /Kronos Sync/g, replace: 'Kairøs OS' },

    // Nomes Isolados (Sensível a maiúsculas para manter estilo)
    { regex: /(?<!Estúdio |Studio |Estudio )KRONOS(?! Tattoo| Sync)/g, replace: 'KAIRØS' },
    { regex: /(?<!Estúdio |Studio |Estudio )Kronos(?! Tattoo| Sync)/g, replace: 'Kairøs' },
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let modified = false;

    // Split por linhas para facilitar visualização de debug
    let lines = content.split('\n');
    let newLines = [];

    lines.forEach((line, index) => {
        let originalLine = line;
        
        // Verifica se a linha tem alguma exclusão forte que impede a alteração nela inteira
        // Mas como usamos regex com lookbehind/lookahead nas rules, podemos aplicar direto
        let newLine = line;
        
        for (const rule of REPLACEMENTS) {
            if (newLine.match(rule.regex)) {
                newLine = newLine.replace(rule.regex, rule.replace);
            }
        }

        if (newLine !== originalLine) {
            console.log(`[${path.basename(filePath)}:${index + 1}]`);
            console.log(`  - ${originalLine.trim()}`);
            console.log(`  + ${newLine.trim()}`);
            modified = true;
        }

        newLines.push(newLine);
    });

    if (modified) {
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
        return true;
    }
    return false;
}

function walkDir(dir) {
    let modifiedFiles = 0;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            modifiedFiles += walkDir(fullPath);
        } else {
            const ext = path.extname(fullPath);
            if (EXTENSIONS.includes(ext)) {
                if (processFile(fullPath)) {
                    modifiedFiles++;
                }
            }
        }
    }
    return modifiedFiles;
}

console.log('Iniciando Sanitização de Marca: KRONOS -> KAIRØS...');
let totalModified = 0;

for (const dir of TARGET_DIRS) {
    const targetPath = path.join(PROJECT_ROOT, dir);
    if (fs.existsSync(targetPath)) {
        console.log(`\nVarrendo diretório: ${dir}/`);
        totalModified += walkDir(targetPath);
    }
}

console.log(`\nConcluído! ${totalModified} arquivos modificados com sucesso.`);
