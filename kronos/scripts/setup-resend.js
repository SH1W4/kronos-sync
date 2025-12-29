// Script para gerenciar a API Key do Resend no .env.local
// Execute: node scripts/setup-resend.js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setupResend() {
    console.log('🔧 Configuração do Resend para KRONOS SYNC');
    console.log('━'.repeat(50));
    console.log('');

    const envPath = path.join(__dirname, '..', '.env.local');

    // Ler arquivo atual
    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Verificar se já existe
    const hasResendKey = envContent.includes('RESEND_API_KEY');

    if (hasResendKey) {
        console.log('⚠️  RESEND_API_KEY já existe no .env.local');
        const update = await question('Deseja atualizar? (s/n): ');

        if (update.toLowerCase() !== 's') {
            console.log('❌ Operação cancelada.');
            rl.close();
            return;
        }
    }

    console.log('');
    console.log('📋 Instruções:');
    console.log('1. Acesse: https://resend.com/api-keys');
    console.log('2. Copie sua API Key (começa com "re_")');
    console.log('3. Cole aqui abaixo');
    console.log('');

    const apiKey = await question('Cole sua API Key do Resend: ');

    if (!apiKey || !apiKey.startsWith('re_')) {
        console.log('❌ API Key inválida. Deve começar com "re_"');
        rl.close();
        return;
    }

    // Atualizar ou adicionar
    if (hasResendKey) {
        // Substituir linha existente
        envContent = envContent.replace(/RESEND_API_KEY=.*/g, `RESEND_API_KEY=${apiKey}`);
    } else {
        // Adicionar nova linha
        envContent += `\n# Resend Email Service\nRESEND_API_KEY=${apiKey}\n`;
    }

    // Salvar arquivo
    fs.writeFileSync(envPath, envContent);

    console.log('');
    console.log('✅ API Key configurada com sucesso!');
    console.log('📁 Arquivo atualizado:', envPath);
    console.log('');
    console.log('🔄 Próximos passos:');
    console.log('1. Reinicie o servidor: npm run dev');
    console.log('2. Teste o envio: node scripts/test-email.js seu-email@exemplo.com');
    console.log('');

    rl.close();
}

setupResend().catch(error => {
    console.error('❌ Erro:', error.message);
    rl.close();
});
