import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'

/**
 * Gets a Google Calendar client for a specific user, 
 * automatically handling OAuth credentials from the Prisma Account table.
 */
export async function getGoogleCalendarClient(userId: string) {
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

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expiry_date: account.expires_at ? account.expires_at * 1000 : undefined
    })

    // Auto-refresh handled by the library if refresh_token is present
    return google.calendar({ version: 'v3', auth: oauth2Client })
}

/**
 * Creates an event in the user's Google Calendar.
 */
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
    if (!calendar) return { success: false, error: 'No Google Account' }

    try {
        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary: eventData.summary,
                description: eventData.description,
                start: { dateTime: eventData.startTime.toISOString() },
                end: { dateTime: eventData.endTime.toISOString() },
                attendees: eventData.attendeeEmail ? [{ email: eventData.attendeeEmail }] : [],
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 60 },
                    ],
                },
            },
        })

        return { success: true, eventId: response.data.id }
    } catch (error: any) {
        console.error('❌ Error creating Google event:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Updates an existing event in the user's Google Calendar.
 */
export async function updateCalendarEvent(
    userId: string,
    googleEventId: string,
    eventData: {
        summary?: string,
        description?: string,
        startTime?: Date,
        endTime?: Date
    }
) {
    const calendar = await getGoogleCalendarClient(userId)
    if (!calendar) return { success: false, error: 'No Google Account' }

    try {
        const response = await calendar.events.patch({
            calendarId: 'primary',
            eventId: googleEventId,
            requestBody: {
                ...(eventData.summary && { summary: eventData.summary }),
                ...(eventData.description && { description: eventData.description }),
                ...(eventData.startTime && { start: { dateTime: eventData.startTime.toISOString() } }),
                ...(eventData.endTime && { end: { dateTime: eventData.endTime.toISOString() } }),
            },
        })

        return { success: true, eventId: response.data.id }
    } catch (error: any) {
        console.error('❌ Error updating Google event:', error)
        if (error.code === 404) return { success: false, error: 'NOT_FOUND' }
        return { success: false, error: error.message }
    }
}

/**
 * Deletes an event from the user's Google Calendar.
 */
export async function deleteCalendarEvent(userId: string, googleEventId: string) {
    const calendar = await getGoogleCalendarClient(userId)
    if (!calendar) return { success: false, error: 'No Google Account' }

    try {
        await calendar.events.delete({
            calendarId: 'primary',
            eventId: googleEventId,
        })
        return { success: true }
    } catch (error: any) {
        console.error('❌ Error deleting Google event:', error)
        if (error.code === 404) return { success: true } // Already gone
        return { success: false, error: error.message }
    }
}
