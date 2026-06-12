import { Resend } from 'resend'

// Fallback for build time when env var might not be set
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendVerificationCode(email: string, code: string) {
  if (!resend) {
    console.error('Resend not configured. Please add RESEND_API_KEY to environment variables.')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'KAIRØS OS <acesso@kairos-os.com.br>',
      to: email,
      subject: 'Seu código de acesso - KAIRØS OS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B5CF6; margin: 0;">KAIRØS OS</h1>
            <p style="color: #999; font-size: 12px; margin-top: 5px;">Sistema de Gestão para Estúdios de Tatuagem</p>
          </div>
          
          <div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 30px; text-align: center;">
            <p style="color: #ccc; margin-bottom: 20px;">Seu código de verificação é:</p>
            <div style="background: #8B5CF6; color: #fff; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">
              Este código expira em <strong>5 minutos</strong>.
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Se você não solicitou este código, ignore este email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
            <p style="color: #666; font-size: 12px;">
              © 2025 KAIRØS OS. Todos os direitos reservados.
            </p>
          </div>
        </div>
      `
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!resend) {
    console.error('Resend not configured for reset password.')
    return { success: false, error: 'Email service not configured' }
  }

  const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'KAIRØS OS <acesso@kairos-os.com.br>',
      to: email,
      subject: 'Recuperação de Acesso - KAIRØS OS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B5CF6; margin: 0;">KAIRØS OS</h1>
            <p style="color: #999; font-size: 12px; margin-top: 5px;">Recuperação de Credencial</p>
          </div>
          
          <div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 30px; text-align: center;">
            <p style="color: #ccc; margin-bottom: 20px;">Recebemos uma solicitação para redefinir sua senha.</p>
            <p style="color: #999; font-size: 14px; margin-bottom: 30px;">
                Clique no botão abaixo para criar uma nova senha segura.
            </p>
            
            <a href="${resetLink}" style="background: #8B5CF6; color: #fff; text-decoration: none; font-weight: bold; padding: 15px 30px; border-radius: 8px; display: inline-block;">
              REDEFINIR SENHA
            </a>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Este link expira em 1 hora.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
            <p style="color: #666; font-size: 12px;">
              Se você não solicitou, ignore este email. Sua conta permanece segura.
            </p>
          </div>
        </div>
      `
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending reset email:', error)
    return { success: false, error }
  }
}

export async function sendGuestExpirationEmail(email: string, artistName: string) {
  if (!resend) {
    console.error('Resend not configured for guest expiration email.')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'KAIRØS OS <acesso@kairos-os.com.br>',
      to: email,
      subject: 'Seu acesso temporário expirou - KAIRØS OS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ef4444; margin: 0;">KAIRØS OS</h1>
            <p style="color: #999; font-size: 12px; margin-top: 5px;">Aviso de Encerramento de Período Guest</p>
          </div>
          
          <div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 30px; text-align: left;">
            <p style="color: #fff; font-size: 18px; font-weight: bold; margin-bottom: 20px;">Olá, ${artistName}!</p>
            <p style="color: #ccc; line-height: 1.6;">
              Informamos que o seu período como <strong>Artista Convidado (Guest)</strong> no estúdio chegou ao fim e seu acesso ao painel do sistema KAIRØS OS foi desativado automaticamente.
            </p>
            <p style="color: #ccc; line-height: 1.6; margin-top: 15px;">
              Fique tranquilo: <strong>todo o seu histórico financeiro, atendimentos e relatórios permanecem salvos no sistema</strong> para que você e os administradores do estúdio possam realizar acertos futuros.
            </p>
            <p style="color: #ccc; line-height: 1.6; margin-top: 15px;">
              Agradecemos pela parceria e desejamos muito sucesso nos seus próximos projetos!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
            <p style="color: #666; font-size: 12px;">
              © 2026 KAIRØS OS. Todos os direitos reservados.
            </p>
          </div>
        </div>
      `
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending guest expiration email:', error)
    return { success: false, error }
  }
}
