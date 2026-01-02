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

    // A. SYSTEM STATUS CHECK
    if (query.includes('status') || query.includes('sistema') || query.includes('ping')) {
        try {
            const start = Date.now()
            await prisma.user.count({ take: 1 }) // Ping DB
            const latency = Date.now() - start
            responseText = `KRONØS OS [ONLINE]. \nLatência Neural: ${latency}ms. \nTodos os sistemas operacionais.`
        } catch (e) {
            responseText = "ALERTA: Falha na conexão com o núcleo de memória (DB Error). Contate o suporte."
        }
    }
    // B. FEEDBACK LOOP
    else if (query.startsWith('feedback') || query.startsWith('sugestão') || query.startsWith('bug') || query.startsWith('ideia')) {
        const feedbackContent = userQuery.replace(/^(feedback|sugestão|bug|ideia)/i, '').trim()

        if (feedbackContent.length < 5) {
            responseText = "Para registrar um feedback, preciso de mais detalhes. Tente: 'sugestão adicionar modo escuro'."
        } else {
            await prisma.agentLog.create({
                data: {
                    userId: session.user.id,
                    workspaceId: session.activeWorkspaceId,
                    query: userQuery,
                    response: "FEEDBACK_ACK",
                    intent: 'USER_FEEDBACK'
                }
            })
            const hash = Math.random().toString(36).substring(7).toUpperCase()
            responseText = `Recebido. Protocolo de melhoria iniciado. ID de Rastreamento: #${hash}. \nObrigado por contribuir com a evolução do sistema.`
        }
    }
    // C. CONTEXTUAL GREETING
    else if (query === 'olá' || query === 'oi' || query === 'hello' || query === 'hi') {
        const hour = new Date().getHours()
        let greeting = "Olá"
        if (hour < 12) greeting = "Bom dia"
        else if (hour < 18) greeting = "Boa tarde"
        else greeting = "Boa noite"

        const firstName = artist.user.name?.split(' ')[0] || "Artista"
        responseText = `${greeting}, ${firstName}. KAI online e aguardando comandos. Tente 'status' ou 'agenda'.`
    }

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
        responseText = `Comando não reconhecido nos meus bancos de dados atuais. \n\nTente comandos como: \n- "Status" (Verificar sistemas) \n- "Agenda" (Seus próximos clientes) \n- "Financeiro" (Seus ganhos) \n- "Sugestão [texto]" (Enviar feedback)`
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
