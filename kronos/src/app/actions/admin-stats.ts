'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function getAdminDashboardStats() {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) return null

    // Buscar o artista/admin logado
    const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        include: {
            artist: { select: { workspaceId: true } },
            memberships: { select: { workspaceId: true, role: true } }
        }
    })

    if (!user || user.role !== 'ADMIN') return null

    // Descobrir o workspaceId do admin
    const workspaceId = user.artist?.workspaceId
        || user.memberships.find(m => m.role === 'ADMIN')?.workspaceId

    if (!workspaceId) return null

    // Ranges de tempo (Brasil/SP)
    const options = { timeZone: 'America/Sao_Paulo' }
    const nowStr = new Date().toLocaleString('en-US', options)
    const now = new Date(nowStr)

    const startOfMonth = new Date(nowStr)
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const startOfLastMonth = new Date(startOfMonth)
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)

    const endOfLastMonth = new Date(startOfMonth)
    endOfLastMonth.setMilliseconds(-1)

    const sixMonthsAgo = new Date(nowStr)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    // ─── QUERY PRINCIPAL ───────────────────────────────────────────────────────
    // Faturamento = soma de booking.studioShare (parte do estúdio) de TODOS os artistas do workspace
    const [
        monthBookings,
        lastMonthBookings,
        totalBookings,
        allArtists,
        historicalBookings,
        pendingSettlements,
        todaysBookings,
    ] = await Promise.all([
        // Bookings do mês atual (para KPIs)
        prisma.booking.findMany({
            where: {
                workspaceId,
                status: { in: ['CONFIRMED', 'COMPLETED'] },
                scheduledFor: { gte: startOfMonth, lte: now }
            },
            select: {
                value: true,
                studioShare: true,
                artistShare: true,
                finalValue: true,
                artistId: true,
                artist: { select: { user: { select: { name: true } } } }
            }
        }),

        // Bookings do mês passado (para comparação de crescimento)
        prisma.booking.findMany({
            where: {
                workspaceId,
                status: { in: ['CONFIRMED', 'COMPLETED'] },
                scheduledFor: { gte: startOfLastMonth, lte: endOfLastMonth }
            },
            select: { studioShare: true }
        }),

        // Total histórico de sessões do workspace
        prisma.booking.count({
            where: {
                workspaceId,
                status: { in: ['CONFIRMED', 'COMPLETED'] }
            }
        }),

        // Todos os artistas do workspace com contagem de sessões
        prisma.artist.findMany({
            where: { workspaceId },
            include: {
                user: { select: { name: true } },
                bookings: {
                    where: {
                        status: { in: ['CONFIRMED', 'COMPLETED'] },
                        scheduledFor: { gte: startOfMonth }
                    },
                    select: { value: true, artistShare: true, studioShare: true }
                }
            }
        }),

        // Histórico de 6 meses para o gráfico
        prisma.booking.findMany({
            where: {
                workspaceId,
                status: { in: ['CONFIRMED', 'COMPLETED'] },
                scheduledFor: { gte: sixMonthsAgo }
            },
            select: {
                value: true,
                studioShare: true,
                scheduledFor: true,
            }
        }),

        // Acertos pendentes de aprovação
        prisma.settlement.count({
            where: {
                workspaceId,
                status: { in: ['PENDING', 'REVIEW'] }
            }
        }),

        // Sessões de hoje (todos os artistas)
        prisma.booking.findMany({
            where: {
                workspaceId,
                status: { not: 'CANCELLED' },
                scheduledFor: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lte: new Date(new Date().setHours(23, 59, 59, 999))
                }
            },
            select: {
                id: true,
                status: true,
                scheduledFor: true,
                client: { select: { name: true } },
                artist: { select: { user: { select: { name: true } } } }
            }
        })
    ])

    // ─── AGREGAÇÕES ────────────────────────────────────────────────────────────

    // 1. Faturamento bruto do estúdio no mês (soma de studioShare)
    const monthlyStudioRevenue = monthBookings.reduce((acc, b) => acc + (b.studioShare || 0), 0)

    // 2. Faturamento bruto total (value) — o que entrou de fato
    const monthlyGrossRevenue = monthBookings.reduce((acc, b) => acc + (b.value || 0), 0)

    // 3. Comissões pagas aos artistas no mês
    const monthlyArtistCommissions = monthBookings.reduce((acc, b) => acc + (b.artistShare || 0), 0)

    // 4. Comparação com mês passado
    const lastMonthRevenue = lastMonthBookings.reduce((acc, b) => acc + (b.studioShare || 0), 0)
    const revenueGrowth = lastMonthRevenue > 0
        ? ((monthlyStudioRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0

    // 5. Ticket médio do mês
    const avgTicket = monthBookings.length > 0 ? monthlyGrossRevenue / monthBookings.length : 0

    // 6. Top performers (artistas com maior faturamento no mês)
    const artistPerformance = allArtists.map(artist => ({
        id: artist.id,
        name: artist.user.name || 'Artista',
        sessionsCount: artist.bookings.length,
        grossRevenue: artist.bookings.reduce((acc, b) => acc + (b.value || 0), 0),
        studioRevenue: artist.bookings.reduce((acc, b) => acc + (b.studioShare || 0), 0),
        artistRevenue: artist.bookings.reduce((acc, b) => acc + (b.artistShare || 0), 0),
    })).sort((a, b) => b.grossRevenue - a.grossRevenue)

    // 7. Gráfico histórico (6 meses)
    const monthlyChartMap = new Map<string, { gross: number; studio: number }>()
    for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const key = d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase()
        monthlyChartMap.set(key, { gross: 0, studio: 0 })
    }
    historicalBookings.forEach(b => {
        const key = new Date(b.scheduledFor).toLocaleString('pt-BR', { month: 'short' }).toUpperCase()
        const current = monthlyChartMap.get(key) || { gross: 0, studio: 0 }
        monthlyChartMap.set(key, {
            gross: current.gross + (b.value || 0),
            studio: current.studio + (b.studioShare || 0)
        })
    })
    const chartData = Array.from(monthlyChartMap.entries()).map(([month, data]) => ({
        month,
        revenue: data.gross,
        studioRevenue: data.studio
    }))

    return {
        workspaceId,
        kpis: {
            monthlyGrossRevenue,      // Total bruto (valor das sessões)
            monthlyStudioRevenue,     // Parte do estúdio (studioShare)
            monthlyArtistCommissions, // Parte dos artistas (artistShare)
            lastMonthRevenue,
            revenueGrowth,
            avgTicket,
            totalSessions: totalBookings,
            monthSessions: monthBookings.length,
            pendingSettlements,
            todaySessions: todaysBookings.length,
        },
        artistPerformance,
        chartData,
        todaysBookings,
    }
}
