'use server'

import { prisma } from "@/lib/prisma"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { getGoogleCalendarClient, createCalendarEvent } from "@/lib/google"
import { revalidatePath } from "next/cache"

/**
 * Check if the current artist has a connected Google Calendar
 * and if the tokens are valid.
 */
export async function getCalendarStatus() {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) return { connected: false }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { artist: true }
        })

        if (!user) return { connected: false }

        // Fetch tokens from Clerk to verify connection
        const client = await clerkClient()
        const response = await client.users.getUserOauthAccessToken(clerkUserId, 'oauth_google');
        const token = response.data[0];

        if (!token) return { connected: false }

        // Check if we have the needed scope
        const hasScope = token.scopes?.includes('https://www.googleapis.com/auth/calendar')

        return {
            connected: true,
            email: user.email,
            hasRequiredScopes: hasScope,
            calendarSyncEnabled: user.artist?.calendarSyncEnabled || false,
            lastSyncedAt: user.artist?.lastSyncedAt || null
        }
    } catch (error) {
        console.error('Error fetching calendar status:', error)
        return { connected: false, error: 'Erro ao verificar conexão' }
    }
}

/**
 * Force sync all future bookings to Google Calendar
 */
export async function syncAllBookings() {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) throw new Error('Unauthorized')

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { artist: true }
        })

        if (!user?.artist) throw new Error('Artist not found')

        // Get all future unsynced bookings
        const bookings = await prisma.booking.findMany({
            where: {
                artistId: user.artist.id,
                scheduledFor: { gte: new Date() },
                status: { not: 'CANCELLED' },
                syncedToGoogle: false
            },
            include: { client: true }
        })

        let successCount = 0
        for (const booking of bookings) {
            const result = await createCalendarEvent(user.id, {
                summary: `Tatuagem: ${booking.client.name}`,
                description: `Sessão agendada via KRONØS\nURL: ${process.env.NEXTAUTH_URL}/artist/agenda`,
                startTime: booking.scheduledFor,
                endTime: new Date(booking.scheduledFor.getTime() + booking.duration * 60000)
            })

            if (result.success) {
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: {
                        googleEventId: result.eventId,
                        syncedToGoogle: true
                    }
                })
                successCount++
            }
        }

        revalidatePath('/artist/agenda')
        return { success: true, count: successCount }

    } catch (error: any) {
        console.error('Error in syncAllBookings:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Fetch events from Google Calendar and identify potential conflicts
 * or block time in KRONØS.
 */
export async function importGoogleEvents(startDate: Date, endDate: Date) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) throw new Error('Unauthorized')

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        })
        if (!user) throw new Error('User not found')

        const calendar = await getGoogleCalendarClient(user.id)
        if (!calendar) return { success: false, error: 'Google Calendar not connected' }

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        })

        const events = response.data.items || []

        // Filter out events created by KRONØS (to avoid duplicates/loop)
        // We look for events that DON'T have a KRONØS ID in the description or extended properties
        // For simplicity in MVP, we return all and let the UI handle the "Ocupado" display

        return { success: true, events }

    } catch (error: any) {
        console.error('Error importing Google events:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Check if the user is available on Google Calendar for the given time range.
 * Returns true if available (no conflicts), false if busy.
 */
/**
 * Check if the user is available on Google Calendar for the given time range.
 * Returns true if available (no conflicts), false if busy.
 */
export async function checkGoogleAvailability(userId: string, start: Date, end: Date, calendarId: string = 'primary'): Promise<boolean> {
    try {
        const calendar = await getGoogleCalendarClient(userId)
        if (!calendar) return true // Assume available if not connected (or handle strict mode later)

        const response = await calendar.events.list({
            calendarId: calendarId,
            timeMin: start.toISOString(),
            timeMax: end.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        })

        const events = response.data.items || []

        // any event in this range that acts as "busy"
        // Google events are "transparent" (Available) or "opaque" (Busy). 
        // Default is opaque.
        const conflicts = events.filter((event: any) => {
            // Filter out "Available" transparency events
            if (event.transparency === 'transparent') return false

            // Filter out our own KRONOS events (optional, but good practice if we don't want to block re-scheduling)
            // But for "new booking", any existing event is a blocker.
            return true
        })

        return conflicts.length === 0

    } catch (error) {
        console.error('Error checking Google availability:', error)
        return true // Fail open? Or fail closed? For MVP better fail open to not block operation on API error.
    }
}
