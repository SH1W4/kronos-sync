import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const date = searchParams.get('date') // Optional filter

        // Fetch slots with bookings
        const slots = await prisma.slot.findMany({
            where: {
                isActive: true,
                startTime: {
                    gte: new Date(), // Only future slots by default? Or all? Let's get all for now for visualization
                }
            },
            include: {
                bookings: {
                    include: {
                        client: true,
                        artist: { include: { user: true } }
                    }
                }
            },
            orderBy: { startTime: 'asc' }
        })

        // Transform to expected format
        const formattedSlots = slots.map(slot => {
            const confirmedBooking = slot.bookings.find(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
            const pendingBooking = slot.bookings.find(b => b.status === 'OPEN')

            let status = 'AVAILABLE'
            let bookingData = undefined

            if (confirmedBooking) {
                status = 'OCCUPIED' // or RESERVED depending on business logic
                bookingData = {
                    client: { name: confirmedBooking.client?.name || 'Cliente' },
                    artist: { user: { name: confirmedBooking.artist?.user?.name || 'Artista' } }
                }
            } else if (pendingBooking) {
                status = 'RESERVED'
                bookingData = {
                    client: { name: pendingBooking.client?.name || 'Cliente' },
                    artist: { user: { name: pendingBooking.artist?.user?.name || 'Artista' } }
                }
            }

            return {
                id: slot.id,
                macaId: slot.macaId,
                startTime: slot.startTime.toISOString().split('T')[1].substring(0, 5), // '09:00'
                endTime: slot.endTime.toISOString(),
                date: slot.startTime.toISOString().split('T')[0], // '2025-01-01'
                status,
                booking: bookingData
            }
        })

        return NextResponse.json({ slots: formattedSlots })

    } catch (error) {
        console.error('Error fetching slots:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
