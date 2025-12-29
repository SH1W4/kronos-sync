// Script para testar envio de email via Resend
// Execute: node scripts/test-email.js seu-email@exemplo.com

const { Resend } = require('resend');

async function testEmail() {
    const email = process.argv[2];

    if (!email) {
        console.error('❌ Erro: Forneça um email como argumento');
        console.log('Uso: node scripts/test-email.js seu-email@exemplo.com');
        process.exit(1);
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.error('❌ Erro: RESEND_API_KEY não encontrada no .env.local');
        console.log('Adicione a chave no arquivo .env.local:');
        console.log('RESEND_API_KEY=re_sua_chave_aqui');
        process.exit(1);
    }

    console.log('📧 Testando envio de email...');
    console.log(`📬 Destinatário: ${email}`);
    console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
    console.log('');

    const resend = new Resend(apiKey);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const result = await resend.emails.send({
            from: 'KRONOS SYNC <onboarding@resend.dev>',
            to: email,
            subject: 'Teste de Email - KRONOS SYNC',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #8B5CF6; margin: 0;">KRONOS SYNC</h1>
                        <p style="color: #999; font-size: 12px; margin-top: 5px;">Sistema de Gestão para Estúdios de Tatuagem</p>
                    </div>
                    
                    <div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 30px; text-align: center;">
                        <p style="color: #ccc; margin-bottom: 20px;">✅ Teste de envio de email bem-sucedido!</p>
                        <p style="color: #ccc; margin-bottom: 20px;">Seu código de verificação é:</p>
                        <div style="background: #8B5CF6; color: #fff; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            ${code}
                        </div>
                        <p style="color: #999; font-size: 14px; margin-top: 20px;">
                            Este é apenas um email de teste.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
                        <p style="color: #666; font-size: 12px;">
                            © 2025 KRONOS SYNC. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            `
        });

        console.log('✅ Email enviado com sucesso!');
        console.log('📋 ID do Email:', result.data?.id);
        console.log('🔢 Código gerado:', code);
        console.log('');
        console.log('📬 Verifique sua caixa de entrada!');

    } catch (error) {
        console.error('❌ Erro ao enviar email:');
        console.error(error.message);

        if (error.message.includes('API key')) {
            console.log('');
            console.log('💡 Dica: Verifique se a API Key está correta');
        }

        if (error.message.includes('domain')) {
            console.log('');
            console.log('💡 Dica: Com o plano gratuito, você só pode enviar para o email cadastrado no Resend');
        }
    }
}

testEmail();
