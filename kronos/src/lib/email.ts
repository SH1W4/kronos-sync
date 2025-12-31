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
      from: process.env.RESEND_FROM_EMAIL || 'KRONOS SYNC <acesso@kronosync.com.br>',
      to: email,
      subject: 'Seu código de acesso - KRONOS SYNC',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B5CF6; margin: 0;">KRONOS SYNC</h1>
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
              © 2025 KRONOS SYNC. Todos os direitos reservados.
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
