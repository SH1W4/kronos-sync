const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\João\\.gemini\\antigravity\\brain\\a94acd8a-fc90-4772-a6df-71a0d6a708f9';
const destDir = 'c:\\Users\\João\\Desktop\\PROJETOS\\05_PLATFORMS\kronos_sync\\kronos\\public\\assets\\gamification\\badges';

const filesToCopy = [
    { src: 'badges_sheet_liquid_chrome_1779859968929.png', dest: 'badges_sheet_liquid_chrome.png' }
];

console.log('🚀 Iniciando a cópia dos distintivos de conquistas...');

filesToCopy.forEach(item => {
    const srcPath = path.join(srcDir, item.src);
    const destPath = path.join(destDir, item.dest);

    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copiado com sucesso: ${item.src} -> ${item.dest}`);
    } else {
        console.log(`❌ Arquivo de origem não encontrado: ${srcPath}`);
    }
});

console.log('🎉 Cópia concluída!');
