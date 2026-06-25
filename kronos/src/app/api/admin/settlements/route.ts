import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET - Listar comissões pendentes por artista
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        // Verificar se é ADMIN
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { memberships: true }
        })

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Apenas administradores podem acessar' }, { status: 403 })
        }

        // Buscar agendamentos confirmados/completados sem settlement
        const bookingsWithoutSettlement = await prisma.booking.findMany({
            where: {
                status: { in: ['CONFIRMED', 'COMPLETED'] },
                settlementId: null
            },
            include: {
                artist: {
                    include: { user: true }
                },
                client: true
            },
            orderBy: {
                scheduledFor: 'desc'
            }
        })

        // Agrupar por artista
        const byArtist = bookingsWithoutSettlement.reduce((acc, booking) => {
            const artistId = booking.artistId
            if (!acc[artistId]) {
                acc[artistId] = {
                    artistId,
                    artistName: booking.artist?.user?.name || 'N/A',
                    artistEmail: booking.artist?.user?.email || 'N/A',
                    bookings: [],
                    totalValue: 0
                }
            }
            acc[artistId].bookings.push(booking)
            acc[artistId].totalValue += booking.finalValue || 0
            return acc
        }, {} as Record<string, any>)

        return NextResponse.json({
            success: true,
            data: Object.values(byArtist)
        })

    } catch (error: any) {
        console.error('[ADMIN SETTLEMENTS] Error:', error)
        return NextResponse.json({ error: 'Erro interno', details: error.message }, { status: 500 })
    }
}

// POST - Criar settlement manual para um artista
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        // Verificar se é ADMIN
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { memberships: true }
        })

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Apenas administradores podem acessar' }, { status: 403 })
        }

        const { artistId, bookingIds, totalValue, proofUrl, status } = await req.json()

        if (!artistId || !bookingIds || bookingIds.length === 0) {
            return NextResponse.json({ error: 'artistId e bookingIds são obrigatórios' }, { status: 400 })
        }

        // Buscar workspace do artista
        const artist = await prisma.artist.findUnique({
            where: { id: artistId },
            include: { user: true }
        })

        if (!artist) {
            return NextResponse.json({ error: 'Artista não encontrado' }, { status: 404 })
        }

        // Criar settlement
        const settlement = await prisma.settlement.create({
            data: {
                artistId,
                workspaceId: artist.workspaceId || '',
                totalValue: totalValue || 0,
                proofUrl,
                status: status || 'APPROVED',
                isAudited: true // Marcado como auditado manualmente pelo ADM
            }
        })

        // Vincular bookings ao settlement
        await prisma.booking.updateMany({
            where: {
                id: { in: bookingIds },
                artistId
            },
            data: {
                settlementId: settlement.id
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Comissão finalizada com sucesso',
            data: settlement
        })

    } catch (error: any) {
        console.error('[ADMIN SETTLEMENTS] Error:', error)
        return NextResponse.json({ error: 'Erro interno', details: error.message }, { status: 500 })
    }
}
