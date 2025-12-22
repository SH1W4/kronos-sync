'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function queryAgent(userQuery: string, history: any[]) {
    const session = await getServerSession(authOptions) as any
    if (!session?.user || !session?.activeWorkspaceId) {
        return { text: "Preciso que você selecione um workspace primeiro.", role: 'KAI' }
    }

    const query = userQuery.toLowerCase()

    // 1. Identificar Contexto do Usuário no Workspace Ativo
    const artist = await prisma.artist.findFirst({
        where: {
            userId: session.user.id,
            workspaceId: session.activeWorkspaceId
        },
        include: {
            user: true,
            bookings: {
                where: {
                    workspaceId: session.activeWorkspaceId,
                    slot: {
                        startTime: { gte: new Date() }
                    }
                },
                orderBy: {
                    slot: {
                        startTime: 'asc'
                    }
                },
                include: { client: true, slot: true },
                take: 5
            }
        }
    })

    if (!artist) return { text: "Não encontrei seu perfil de artista neste workspace.", role: 'KAI' }

    // 2. Lógica de Resposta baseada em Regras (Com Workspace Isolation)
    let responseText = ""

    if (query.includes('ganho') || query.includes('faturei') || query.includes('financeiro')) {
        const aggregations = await prisma.booking.aggregate({
            where: {
                workspaceId: session.activeWorkspaceId,
                artistId: artist.id,
                status: 'COMPLETED'
            },
            _sum: { artistShare: true }
        })
        const total = aggregations._sum.artistShare || 0
        responseText = `Com base nos seus registros deste estúdio, você acumulou um total de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)} em comissões.`
    }
    else if (query.includes('equipe') || query.includes('artistas') || query.includes('instagram')) {
        const artistsInWorkspace = await prisma.artist.findMany({
            where: { workspaceId: session.activeWorkspaceId },
            include: { user: true }
        })
        const count = artistsInWorkspace.length
        const instaList = artistsInWorkspace
            .filter(a => a.instagram)
            .map(a => `@${a.instagram?.replace('@', '')}`)
            .join(', ')

        responseText = `Atualmente temos ${count} artistas neste estúdio. IDs digitais ativos: ${instaList || 'Nenhum Instagram mapeado ainda.'}.`
    }
    else if (query.includes('agenda') || query.includes('agendamento')) {
        if (artist.bookings.length === 0) {
            responseText = "Você não tem agendamentos próximos registrados aqui."
        } else {
            const nextBooking = artist.bookings[0]
            const date = new Date(nextBooking.slot.startTime).toLocaleDateString('pt-BR')
            responseText = `Você tem ${artist.bookings.length} agendamentos futuros. O próximo é com ${nextBooking.client.name} em ${date}.`
        }
    }
    else {
        responseText = `Olá ${artist.user.name?.split(' ')[0]}! Sou KAI. Ainda estou aprendendo a analisar dados complexos deste workspace, mas posso te passar seus ganhos ou agenda.`
    }

    // Log Interaction
    await prisma.agentLog.create({
        data: {
            userId: session.user.id,
            workspaceId: session.activeWorkspaceId,
            query: userQuery,
            response: responseText,
            intent: 'WORKSPACE_QUERY'
        }
    })

    return { text: responseText, role: 'KAI' }
}
