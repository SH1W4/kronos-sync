const fs = require('fs');
const path = require('path');

// Pasta raiz de dados do app do agente
const appDataDir = 'C:\\Users\\João\\.gemini\\antigravity';
// Pasta de destino pública do projeto
const destDir = 'c:\\Users\\João\\Desktop\\PROJETOS\\05_PLATFORMS\\kronos_sync\\kronos\\public\\assets\\gamification\\badges';

// Garantir que a pasta de destino exista
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

console.log('🚀 Buscando todas as folhas de insígnias na pasta do agente...');

// Mapeamento dos arquivos específicos conhecidos para nomes amigáveis
const fileMapping = {
    'badges_sheet_v2_1768703143422.png': 'badges_sheet_v2.png',
    'badges_sheet_v3_metallic_1768703230947.png': 'badges_sheet_v3_metallic.png',
    'badges_sheet_v4_mystic_tech_1768703436945.png': 'badges_sheet_v4_mystic_tech.png',
    'badges_sheet_v5_divine_icons_1768703678396.png': 'badges_sheet_v5_divine_icons.png',
    'badges_sheet_kronos_1779859767151.png': 'badges_sheet_kronos.png',
    'badges_sheet_liquid_chrome_1779859968929.png': 'badges_sheet_liquid_chrome.png'
};

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Ignorar pastas de sistema comuns para acelerar a busca
            if (!file.startsWith('.') && file !== 'node_modules') {
                walkDir(fullPath);
            }
        } else {
            // Verificar se o arquivo está no nosso mapeamento ou se é uma imagem de folha
            if (fileMapping[file]) {
                const targetName = fileMapping[file];
                const destPath = path.join(destDir, targetName);
                fs.copyFileSync(fullPath, destPath);
                console.log(`✅ Copiado via Mapeamento: ${file} -> ${targetName}`);
            } else if (file.toLowerCase().includes('badges_sheet') && (file.endsWith('.png') || file.endsWith('.webp'))) {
                // Copia com o nome original se não estiver no mapeamento direto
                const destPath = path.join(destDir, file);
                fs.copyFileSync(fullPath, destPath);
                console.log(`✅ Copiado Genericamente: ${file}`);
            }
        }
    }
}

try {
    walkDir(appDataDir);
    console.log('🎉 Todas as folhas de insígnias foram organizadas e trazidas para a pasta do projeto com sucesso!');
} catch (err) {
    console.error('❌ Erro durante a cópia dos arquivos:', err);
}
