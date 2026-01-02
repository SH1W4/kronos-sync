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

    // ---------------------------------------------------------
    // KAI NATURAL LANGUAGE ENGINE (Pattern Matcher v1.0)
    // ---------------------------------------------------------

    // 1. HELP / GREETING PATTERNS
    if (/^(ol[áa]|oi|hello|hi|ajuda|help)/i.test(query)) {
        const hour = new Date().getHours()
        let greeting = "Olá"
        if (hour < 12) greeting = "Bom dia"
        else if (hour < 18) greeting = "Boa tarde"
        else greeting = "Boa noite"

        const firstName = artist.user.name?.split(' ')[0] || "Artista"
        responseText = `${greeting}, ${firstName}. Sou KAI. Tente me perguntar: 'Como tá o sistema?', 'Quanto eu ganhei?' ou 'Tenho cliente hoje?'.`
    }

    // 2. STATUS CHECK PATTERNS
    // Ex: "Como está o sistema?", "Status do servidor", "Diagnóstico"
    else if (/(sistema|servidor|banco|status).*(ok|online|funcionando)|(como).*(sistema|hoje)|diagn[oó]stico|ping/i.test(query)) {
        try {
            const start = Date.now()
            await prisma.user.count({ take: 1 })
            const latency = Date.now() - start
            responseText = `KRONØS OS [ONLINE]. \nLatência Neural: ${latency}ms. \nTodos os sistemas operacionais e seguros.`
        } catch (e) {
            responseText = "ALERTA CRÍTICO: Falha na conexão com o núcleo de memória (DB Error). Contate o suporte imediatamente."
        }
    }

    // 3. FINANCIAL REPORT PATTERNS
    // Ex: "Quanto eu faturei?", "Meu saldo", "Ver financeiro", "Comissões"
    else if (/(quanto|qual).*(ganhei|faturei|lucro|comiss[aã]o)|(meu).*(dinheiro|saldo|extrato)|financeiro/i.test(query)) {
        const aggregations = await prisma.booking.aggregate({
            where: {
                workspaceId: session.activeWorkspaceId,
                artistId: artist.id,
                status: 'COMPLETED'
            },
            _sum: { artistShare: true }
        })
        const total = aggregations._sum.artistShare || 0
        const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)

        responseText = `Analisando seus registros financeiros... \nVocê acumulou um total de ${formatted} em comissões neste estúdio.`
    }

    // 4. SCHEDULE / BOOKING PATTERNS
    // Ex: "Quem é o próximo?", "Minha agenda", "Tenho cliente hoje?"
    else if (/(quem|qual|quando).*(pr[oó]xim[oa]|cliente|agendamento|sess[aã]o)|(minha).*(agenda|hoje)|agenda/i.test(query)) {
        if (artist.bookings.length === 0) {
            responseText = "Consultei sua agenda e não encontrei agendamentos confirmados para os próximos dias."
        } else {
            const nextBooking = artist.bookings[0]
            const date = new Date(nextBooking.slot.startTime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
            responseText = `Você tem ${artist.bookings.length} sessões agendadas recentemente. \nA próxima é com ${nextBooking.client.name} em ${date}.`
        }
    }

    // 5. TEAM INFO PATTERNS
    // Ex: "Quem trabalha aqui?", "Lista de artistas", "Instagram da galera"
    else if (/(quem|lista).*(equipe|trabalha|artistas)|instagram/i.test(query)) {
        const artistsInWorkspace = await prisma.artist.findMany({
            where: { workspaceId: session.activeWorkspaceId },
            include: { user: true }
        })
        const count = artistsInWorkspace.length
        const instaList = artistsInWorkspace
            .filter(a => a.instagram)
            .map(a => `@${a.instagram?.replace('@', '')}`)
            .join(', ')

        responseText = `O esquadrão deste estúdio conta com ${count} artistas. \nConexões ativas: ${instaList || 'Nenhum Instagram mapeado.'}`
    }

    // 6. FEEDBACK PATTERNS
    // Ex: "Sugestão: mudar cor", "Quero deixar um feedback", "Bug no login"
    else if (/(sugest[aã]o|ideia|bug|melhoria):?\s+(.+)|(gostaria|queria).*(deixar|dar).*(feedback|sugest[aã]o)/i.test(query) || query.startsWith('feedback')) {
        // Tenta extrair o conteúdo se vier no formato "Sugestão: blabla"
        const cleanContent = query.replace(/^(feedback|sugest[aã]o|ideia|bug|melhoria):?\s*/i, '').trim()

        if (cleanContent.length < 5 || cleanContent === query) {
            // Se o cleanContent for igual a query, significa que o regex de replace não achou o prefixo, ou o user só digitou "quero deixar feedback"
            if (query.match(/(gostaria|queria).*(deixar|dar).*(feedback|sugest[aã]o)/i)) {
                responseText = "Claro, estou ouvindo. Digite: 'Sugestão: [sua ideia]' ou 'Bug: [o problema]' para eu registrar."
            } else {
                responseText = "Para registrar, seja mais específico. Exemplo: 'Sugestão: Adicionar modo escuro'."
            }
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
            responseText = `[PROTOCOLO #${hash}] \nEntendido. Sua contribuição foi criptografada e enviada para o núcleo de desenvolvimento.`
        }
    }

    // DEFAULT FALLBACK
    else {
        responseText = `Não consegui decodificar esse padrão de linguagem ("${userQuery}"). \n\nTente ser mais direto, como: \n- "Como está minha agenda?" \n- "Quanto eu ganhei?" \n- "Status do sistema"`
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
