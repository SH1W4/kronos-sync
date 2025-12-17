import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'

export async function getGoogleCalendarClient(userId: string) {
    // 1. Buscar credenciais do Google para este usuário
    const account = await prisma.account.findFirst({
        where: {
            userId,
            provider: 'google'
        }
    })

    if (!account || !account.access_token) {
        console.warn(`⚠️ Usuário ${userId} não tem conta Google conectada.`)
        return null
    }

    // 2. Configurar cliente OAuth2
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )

    // 3. Setar credenciais
    oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expiry_date: account.expires_at ? account.expires_at * 1000 : undefined
    })

    // 4. Retornar cliente Calendar
    return google.calendar({ version: 'v3', auth: oauth2Client })
}

export async function createCalendarEvent(
    userId: string,
    eventData: {
        summary: string,
        description: string,
        startTime: Date,
        endTime: Date,
        attendeeEmail?: string
    }
) {
    const calendar = await getGoogleCalendarClient(userId)

    if (!calendar) {
        return { success: false, error: 'No Google Account' }
    }

    try {
        const event = {
            summary: eventData.summary,
            description: eventData.description,
            start: {
                dateTime: eventData.startTime.toISOString(),
            },
            end: {
                dateTime: eventData.endTime.toISOString(),
            },
            attendees: eventData.attendeeEmail ? [{ email: eventData.attendeeEmail }] : [],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 60 },
                ],
            },
        }

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event, // googleapis v118+ uses requestBody
        })

        console.log(`✅ Evento criado no Google Calendar: ${response.data.id}`)
        return { success: true, eventId: response.data.id }

    } catch (error: any) {
        console.error('❌ Erro ao criar evento no Google:', error)
        return { success: false, error: error.message }
    }
}
