'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { revalidatePath } from "next/cache"

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

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                artistId: user.artist.id,
                clientId: data.clientId,
                workspaceId,
                slotId: 'temp-slot-' + Date.now(), // TODO: Implement proper slot management
                value: data.estimatedPrice,
                finalValue: data.estimatedPrice,
                studioShare: data.estimatedPrice * (1 - user.artist.commissionRate),
                artistShare: data.estimatedPrice * user.artist.commissionRate,
                status: data.status || 'OPEN',
                scheduledFor: data.scheduledFor,
                duration: data.duration,
                notes: data.notes,
                syncedToGoogle: false
            },
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

        // TODO: Sync to Google Calendar if syncToGoogle is true

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

        // TODO: Merge with Google Calendar events if includeGoogleEvents is true

        return { success: true, bookings }

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

        // TODO: Update Google Calendar event if synced

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

        // TODO: Delete Google Calendar event if synced

        revalidatePath('/artist/agenda')
        return { success: true }

    } catch (error) {
        console.error('Error deleting booking:', error)
        return { error: 'Erro ao deletar agendamento' }
    }
}
