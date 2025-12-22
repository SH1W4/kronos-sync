'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { revalidatePath } from "next/cache"
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, getGoogleCalendarClient } from "@/lib/google"

/**
 * Create a new booking
 */
export async function createBooking(data: {
    clientId: string
    scheduledFor: Date
    duration: number
    type: string
    estimatedPrice: number
    notes?: string
    status?: 'OPEN' | 'CONFIRMED'
    syncToGoogle?: boolean
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return { error: 'Não autorizado' }
        }

        // Get artist from session
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { artist: true }
        })

        if (!user?.artist) {
            return { error: 'Apenas artistas podem criar agendamentos' }
        }

        const workspaceId = (session.user as any).activeWorkspaceId

        if (!workspaceId) {
            return { error: 'Workspace não encontrado' }
        }

        // Check for time conflicts
        const conflictingBooking = await prisma.booking.findFirst({
            where: {
                artistId: user.artist.id,
                scheduledFor: {
                    gte: data.scheduledFor,
                    lt: new Date(data.scheduledFor.getTime() + data.duration * 60000)
                },
                status: {
                    not: 'CANCELLED'
                }
            }
        })

        if (conflictingBooking) {
            return { error: 'Já existe um agendamento neste horário' }
        }

        // Create Slot first (needed as it's a required related model)
        const slot = await prisma.slot.create({
            data: {
                workspaceId,
                macaId: 1, // Defaulting to table 1 for demo
                startTime: data.scheduledFor,
                endTime: new Date(data.scheduledFor.getTime() + data.duration * 60000),
                isActive: true
            }
        })

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                artistId: user.artist.id,
                clientId: data.clientId,
                workspaceId,
                slotId: slot.id,
                value: data.estimatedPrice,
                finalValue: data.estimatedPrice,
                studioShare: data.estimatedPrice * user.artist.commissionRate,
                artistShare: data.estimatedPrice * (1 - user.artist.commissionRate),
                status: data.status || 'OPEN',
                scheduledFor: data.scheduledFor,
                duration: data.duration,
                notes: data.notes as any,
                syncedToGoogle: false
            } as any,
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        })

        // 3. Sync to Google Calendar
        if (data.syncToGoogle) {
            try {
                const googleResult = await createCalendarEvent(user.id, {
                    summary: `Tatuagem: ${(booking as any).client.name}`,
                    description: `Sessão agendada via KRONØS\n\nTipo: ${data.type}\nObs: ${data.notes || ''}`,
                    startTime: data.scheduledFor,
                    endTime: new Date(data.scheduledFor.getTime() + data.duration * 60000)
                })

                if (googleResult.success && googleResult.eventId) {
                    await prisma.booking.update({
                        where: { id: booking.id },
                        data: {
                            googleEventId: googleResult.eventId,
                            syncedToGoogle: true
                        }
                    })
                }
            } catch (syncError) {
                console.warn('⚠️ Falha no sync inicial com Google:', syncError)
            }
        }

        revalidatePath('/artist/agenda')
        return { success: true, booking }

    } catch (error) {
        console.error('Error creating booking:', error)
        return { error: 'Erro ao criar agendamento' }
    }
}

/**
 * Get artist's bookings for a date range
 */
export async function getMyBookings(data: {
    startDate: Date
    endDate: Date
    includeGoogleEvents?: boolean
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { artist: true }
        })

        if (!user?.artist) {
            return { error: 'Apenas artistas podem ver agendamentos' }
        }

        const bookings = await prisma.booking.findMany({
            where: {
                artistId: user.artist.id,
                scheduledFor: {
                    gte: data.startDate,
                    lte: data.endDate
                }
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        image: true
                    }
                }
            },
            orderBy: {
                scheduledFor: 'asc'
            }
        })

        // 3. Merge with Google Calendar events if requested
        let unifiedEvents: any[] = [...bookings]

        if (data.includeGoogleEvents) {
            try {
                const calendar = await getGoogleCalendarClient(user.id)
                if (calendar) {
                    const googleResponse = await calendar.events.list({
                        calendarId: 'primary',
                        timeMin: data.startDate.toISOString(),
                        timeMax: data.endDate.toISOString(),
                        singleEvents: true,
                        orderBy: 'startTime',
                    })

                    const googleEvents = googleResponse.data.items || []

                    // Filter out events that are already in KRONØS (matches by googleEventId)
                    const kronosGoogleIds = new Set(bookings.map(b => b.googleEventId).filter(Boolean))

                    const externalEvents = googleEvents
                        .filter((ge: any) => !kronosGoogleIds.has(ge.id))
                        .map((ge: any) => ({
                            id: `google-${ge.id}`,
                            isExternal: true,
                            title: ge.summary || '(Sem Título)',
                            scheduledFor: new Date(ge.start?.dateTime || ge.start?.date || ''),
                            duration: ge.end?.dateTime
                                ? Math.floor((new Date(ge.end.dateTime).getTime() - new Date(ge.start?.dateTime || '').getTime()) / 60000)
                                : 60,
                            status: 'EXTERNAL'
                        }))

                    unifiedEvents = [...unifiedEvents, ...externalEvents]
                }
            } catch (syncError) {
                console.warn('⚠️ Erro ao buscar eventos do Google para o calendário:', syncError)
            }
        }

        return { success: true, bookings: unifiedEvents }

    } catch (error) {
        console.error('Error fetching bookings:', error)
        return { error: 'Erro ao buscar agendamentos' }
    }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(data: {
    bookingId: string
    status: 'OPEN' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { artist: true }
        })

        if (!user?.artist) {
            return { error: 'Não autorizado' }
        }

        // Verify ownership
        const booking = await prisma.booking.findUnique({
            where: { id: data.bookingId }
        })

        if (!booking) {
            return { error: 'Agendamento não encontrado' }
        }

        if (booking.artistId !== user.artist.id && (session.user as any).role !== 'ADMIN') {
            return { error: 'Você não tem permissão para alterar este agendamento' }
        }

        // Update status
        const updatedBooking = await prisma.booking.update({
            where: { id: data.bookingId },
            data: { status: data.status },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        })

        // 3. Update Google Calendar event if synced
        if (updatedBooking.syncedToGoogle && updatedBooking.googleEventId) {
            try {
                await updateCalendarEvent(user.id, updatedBooking.googleEventId, {
                    summary: `Tatuagem: ${updatedBooking.client.name} (${data.status})`,
                    description: `Status atualizado para: ${data.status}\n\nObs: ${(updatedBooking as any).notes || ''}`
                })
            } catch (syncError) {
                console.warn('⚠️ Falha ao atualizar evento no Google:', syncError)
            }
        }

        revalidatePath('/artist/agenda')
        return { success: true, booking: updatedBooking }

    } catch (error) {
        console.error('Error updating booking status:', error)
        return { error: 'Erro ao atualizar status' }
    }
}

/**
 * Delete booking
 */
export async function deleteBooking(bookingId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { artist: true }
        })

        if (!user?.artist) {
            return { error: 'Não autorizado' }
        }

        // Verify ownership
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        })

        if (!booking) {
            return { error: 'Agendamento não encontrado' }
        }

        if (booking.artistId !== user.artist.id && (session.user as any).role !== 'ADMIN') {
            return { error: 'Você não tem permissão para deletar este agendamento' }
        }

        // Delete booking
        await prisma.booking.delete({
            where: { id: bookingId }
        })

        // 3. Delete Google Calendar event if synced
        if (booking.syncedToGoogle && booking.googleEventId) {
            try {
                await deleteCalendarEvent(user.id, booking.googleEventId)
            } catch (syncError) {
                console.warn('⚠️ Falha ao deletar evento no Google:', syncError)
            }
        }

        revalidatePath('/artist/agenda')
        return { success: true }

    } catch (error) {
        console.error('Error deleting booking:', error)
        return { error: 'Erro ao deletar agendamento' }
    }
}
