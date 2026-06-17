import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addXP, unlockAchievement } from '@/lib/gamification'
import { calculateCommission, calculateBookingSplit } from '@/lib/business-rules'

export async function GET(req: NextRequest) {
    // 1. Proteger a rota usando CRON_SECRET
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    try {
        const now = new Date()

        // 2. Query: Buscar agendamentos OPEN ou CONFIRMED que já passaram da data
        const expiredBookings = await prisma.booking.findMany({
            where: {
                status: { in: ['OPEN', 'CONFIRMED'] },
                scheduledFor: { lt: now },
                NOT: { status: 'CANCELLED' }
            },
            include: {
                artist: {
                    include: { user: true }
                },
                client: true
            }
        })

        if (expiredBookings.length === 0) {
            return NextResponse.json({ message: 'Nenhum agendamento expirado encontrado.', confirmed: 0 })
        }

        console.log(`[cron-auto-confirm-bookings] Encontrados ${expiredBookings.length} agendamentos expirados para confirmação automática.`)

        let confirmedCount = 0

        // 3. Processar cada agendamento expirado
        for (const booking of expiredBookings) {
            try {
                // Recalcular o split financeiro ao confirmar automaticamente
                const artist = await prisma.artist.findUnique({
                    where: { id: booking.artistId }
                })

                if (!artist) {
                    console.warn(`[cron-auto-confirm-bookings] Artista não encontrado para booking ${booking.id}`)
                    continue
                }

                const commissionRate = calculateCommission(artist.plan, artist.monthlyEarnings || 0)
                const { finalValue, artistShare, studioShare } = calculateBookingSplit(
                    booking.value,
                    booking.discountValue || 0,
                    commissionRate
                )

                // Atualizar status para COMPLETED
                const updatedBooking = await prisma.booking.update({
                    where: { id: booking.id },
                    data: {
                        status: 'COMPLETED',
                        finalValue,
                        artistShare,
                        studioShare
                    }
                })

                // Gamification: Adicionar XP
                const xpEarned = Math.floor((updatedBooking.finalValue || 0) / 10)
                
                if (xpEarned > 0) {
                    await addXP(artist.id, xpEarned, 'TATTOO_SESSION')
                    console.log(`🎮 Gamification: +${xpEarned} XP adicionados para artista ${artist.id} (confirmação automática)`)
                }

                // Verificar achievements
                const completedBookingsCount = await prisma.booking.count({
                    where: {
                        artistId: artist.id,
                        status: 'COMPLETED'
                    }
                })

                if (completedBookingsCount === 1) {
                    await unlockAchievement(artist.id, 'FIRST_INK')
                    console.log(`🏆 Achievement desbloqueado: FIRST_INK para artista ${artist.id} (confirmação automática)`)
                }

                if ((updatedBooking.finalValue || 0) >= 2000) {
                    await unlockAchievement(artist.id, 'HIGH_ROLLER')
                    console.log(`🏆 Achievement desbloqueado: HIGH_ROLLER para artista ${artist.id} (confirmação automática)`)
                }

                // Disparar webhook n8n
                try {
                    const { dispatchWebhook } = await import('@/lib/webhook')
                    await dispatchWebhook({
                        event: 'BOOKING_COMPLETED',
                        data: {
                            bookingId: updatedBooking.id,
                            clientPhone: updatedBooking.client.phone,
                            clientName: updatedBooking.client.name,
                            artistName: artist.user.name,
                            status: 'COMPLETED',
                            autoConfirmed: true
                        }
                    })
                } catch (webhookError) {
                    console.error(`[cron-auto-confirm-bookings] Falha ao disparar webhook:`, webhookError)
                }

                confirmedCount++
                console.log(`[cron-auto-confirm-bookings] Booking ${booking.id} confirmado automaticamente.`)

            } catch (err) {
                console.error(`[cron-auto-confirm-bookings] Falha ao processar booking ${booking.id}:`, err)
            }
        }

        return NextResponse.json({
            success: true,
            confirmed: confirmedCount
        })

    } catch (error: any) {
        console.error('[cron-auto-confirm-bookings] Erro geral no cron:', error)
        return NextResponse.json({ error: 'Erro interno no cron job' }, { status: 500 })
    }
}
