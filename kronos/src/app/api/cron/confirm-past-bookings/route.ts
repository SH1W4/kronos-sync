import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        // Verificar autenticação via CRON_SECRET
        const authHeader = req.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('[CRON] Iniciando confirmação de agendamentos passados não cancelados')

        // Buscar agendamentos passados que não foram cancelados
        const pastBookings = await prisma.booking.findMany({
            where: {
                status: 'OPEN',
                scheduledFor: {
                    lt: new Date() // Data anterior a hoje
                }
            },
            include: {
                artist: {
                    include: { user: true }
                }
            }
        })

        console.log(`[CRON] Encontrados ${pastBookings.length} agendamentos passados não cancelados`)

        let confirmedCount = 0
        let xpAdded = 0

        for (const booking of pastBookings) {
            try {
                // Confirmar agendamento
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: { status: 'CONFIRMED' }
                })

                // Adicionar XP ao artista via ArtistGamification
                if (booking.artist) {
                    const xpGain = 10 // XP por agendamento confirmado
                    
                    // Criar ou atualizar ArtistGamification
                    const gamification = await prisma.artistGamification.findUnique({
                        where: { artistId: booking.artist.id }
                    })

                    if (gamification) {
                        await prisma.artistGamification.update({
                            where: { artistId: booking.artist.id },
                            data: { xp: { increment: xpGain } }
                        })
                    } else {
                        await prisma.artistGamification.create({
                            data: {
                                artistId: booking.artist.id,
                                xp: xpGain
                            }
                        })
                    }
                    xpAdded += xpGain

                    // Verificar achievements
                    const updatedGamification = await prisma.artistGamification.findUnique({
                        where: { artistId: booking.artist.id },
                        include: { achievements: true }
                    })

                    if (updatedGamification) {
                        const achievementIds = updatedGamification.achievements.map(a => a.achievementId)
                        
                        // Achievement: 10 agendamentos confirmados (100 XP)
                        if (updatedGamification.xp >= 100 && !achievementIds.includes('first_10_bookings')) {
                            await prisma.artistAchievement.create({
                                data: {
                                    artistGamificationId: updatedGamification.id,
                                    achievementId: 'first_10_bookings',
                                    unlockedAt: new Date()
                                }
                            })
                        }

                        // Achievement: 50 agendamentos confirmados (500 XP)
                        if (updatedGamification.xp >= 500 && !achievementIds.includes('veteran_artist')) {
                            await prisma.artistAchievement.create({
                                data: {
                                    artistGamificationId: updatedGamification.id,
                                    achievementId: 'veteran_artist',
                                    unlockedAt: new Date()
                                }
                            })
                        }
                    }
                }

                confirmedCount++
                console.log(`[CRON] Agendamento ${booking.id} confirmado para artista ${booking.artist?.user?.name}`)
            } catch (error) {
                console.error(`[CRON] Erro ao confirmar agendamento ${booking.id}:`, error)
            }
        }

        return NextResponse.json({
            success: true,
            message: `Confirmados ${confirmedCount} agendamentos passados`,
            stats: {
                totalFound: pastBookings.length,
                confirmed: confirmedCount,
                xpAdded: xpAdded
            }
        })

    } catch (error: any) {
        console.error('[CRON] Erro ao confirmar agendamentos passados:', error)
        return NextResponse.json({
            error: 'Erro interno ao confirmar agendamentos',
            details: error.message
        }, { status: 500 })
    }
}
