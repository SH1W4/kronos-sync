import { Resend } from 'resend'
import { formatDate, formatCurrency } from './utils'

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'KRONOS SYNC <contato@kronosync.com.br>'

interface BookingNotificationData {
    clientName: string
    clientEmail: string
    artistName: string
    studioName: string
    scheduledFor: Date
    duration: number
    value: number
    bookingId: string
}

export async function sendBookingConfirmation(data: BookingNotificationData) {
    if (!resend || !data.clientEmail) return { success: false, error: 'Resend not configured or email missing' }

    try {
        const dateStr = formatDate(data.scheduledFor)

        await resend.emails.send({
            from: FROM_EMAIL,
            to: data.clientEmail,
            subject: `Agendamento Confirmado: ${data.studioName}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff; border-radius: 16px; border: 1px solid #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B5CF6; margin: 0; font-size: 24px; letter-spacing: 2px;">KRONØS SYNC</h1>
            <p style="color: #666; font-size: 12px; margin-top: 5px;">PROTOCOLO DE AGENDAMENTO ATIVO</p>
          </div>
          
          <div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 25px;">
            <h2 style="color: #fff; margin-top: 0; font-size: 18px;">Olá, ${data.clientName}!</h2>
            <p style="color: #aaa; line-height: 1.6;">Seu agendamento no <strong>${data.studioName}</strong> foi confirmado com sucesso.</p>
            
            <div style="margin: 25px 0; padding: 20px; background: #000; border-left: 4px solid #8B5CF6; border-radius: 4px;">
              <p style="margin: 5px 0; color: #888; font-size: 12px;">ARTISTA</p>
              <p style="margin: 0 0 15px 0; color: #fff; font-size: 16px; font-weight: bold;">${data.artistName}</p>
              
              <p style="margin: 5px 0; color: #888; font-size: 12px;">DATA E HORÁRIO</p>
              <p style="margin: 0 0 15px 0; color: #fff; font-size: 16px;">${dateStr}</p>
              
              <p style="margin: 5px 0; color: #888; font-size: 12px;">VALOR ESTIMADO</p>
              <p style="margin: 0; color: #fff; font-size: 16px;">${formatCurrency(data.value)}</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL}/fichas/${data.bookingId}" 
                 style="display: inline-block; background: #8B5CF6; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; transition: all 0.3s ease;">
                PREENCHER ANAMNESE DIGITAL
              </a>
              <p style="color: #555; font-size: 11px; margin-top: 15px;">
                * O preenchimento da anamnese é obrigatório antes da sessão para sua segurança.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #222;">
            <p style="color: #444; font-size: 10px;">
              GERADO POR KRONØS SYNC ENGINE // SYMBEON LABS<br>
              © 2026 ${data.studioName.toUpperCase()}
            </p>
          </div>
        </div>
      `
        })
        return { success: true }
    } catch (error) {
        console.error('Error sending confirmation email:', error)
        return { success: false, error }
    }
}

export async function sendBookingReminder(data: BookingNotificationData) {
    if (!resend || !data.clientEmail) return { success: false, error: 'Resend not configured or email missing' }

    try {
        const dateStr = formatDate(data.scheduledFor)

        await resend.emails.send({
            from: FROM_EMAIL,
            to: data.clientEmail,
            subject: `Lembrete: Sua sessão no ${data.studioName} é amanhã!`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff; border-radius: 16px; border: 1px solid #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B5CF6; margin: 0; font-size: 24px; letter-spacing: 2px;">KRONØS SYNC</h1>
            <p style="color: #666; font-size: 12px; margin-top: 5px;">ALERTA DE CRONOGRAMA</p>
          </div>
          
          <div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 25px;">
            <h2 style="color: #fff; margin-top: 0; font-size: 18px;">Tudo pronto, ${data.clientName}?</h2>
            <p style="color: #aaa; line-height: 1.6;">Passando para lembrar da sua sessão de amanhã no <strong>${data.studioName}</strong>.</p>
            
            <div style="margin: 25px 0; padding: 20px; background: #000; border-left: 4px solid #8B5CF6; border-radius: 4px;">
              <p style="margin: 5px 0; color: #888; font-size: 12px;">ARTISTA</p>
              <p style="margin: 0 0 15px 0; color: #fff; font-size: 16px; font-weight: bold;">${data.artistName}</p>
              
              <p style="margin: 5px 0; color: #888; font-size: 12px;">HORÁRIO ATUALIZADO</p>
              <p style="margin: 0; color: #fff; font-size: 16px;">${dateStr}</p>
            </div>

            <div style="background: #1a1523; border: 1px solid #2d2438; border-radius: 8px; padding: 15px; margin-top: 20px;">
              <p style="color: #d8b4fe; font-size: 13px; margin: 0;">
                <strong>Dica:</strong> Lembre-se de se alimentar bem antes da sessão e não consumir bebidas alcoólicas nas 24h anteriores.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #222;">
            <p style="color: #444; font-size: 10px;">
              MENSAGEM AUTOMÁTICA // NÃO RESPONDA ESTE E-MAIL<br>
              © 2026 KRONØS SYNC SYMBOLIC
            </p>
          </div>
        </div>
      `
        })
        return { success: true }
    } catch (error) {
        console.error('Error sending reminder email:', error)
        return { success: false, error }
    }
}
