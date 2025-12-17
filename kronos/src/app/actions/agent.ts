'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function queryAgent(userQuery: string, history: any[]) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { text: "Preciso que você faça login primeiro.", role: 'System' }

    // Simulação de RAG/Intenção
    const query = userQuery.toLowerCase()

    // 1. Identificar Contexto do Usuário
    const artist = await prisma.artist.findUnique({
        where: { userId: session.user.id },
        include: {
            user: true,
            bookings: {
                where: {
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

    if (!artist) return { text: "Não encontrei seu perfil de artista.", role: 'KAI' }

    // 2. Lógica de Resposta baseada em Regras (MVP do RAG)
    let responseText = ""

    if (query.includes('ganho') || query.includes('faturei') || query.includes('financeiro')) {
        const aggregations = await prisma.booking.aggregate({
            where: { artistId: artist.id, status: 'COMPLETED' },
            _sum: { artistShare: true }
        })
        const total = aggregations._sum.artistShare || 0
        responseText = `Com base nos seus registros, você acumulou um total de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)} em comissões recebidas.`
    }
    else if (query.includes('agenda') || query.includes('agendamento') || query.includes('hoje')) {
        if (artist.bookings.length === 0) {
            responseText = "Você não tem agendamentos próximos registrados no sistema."
        } else {
            const nextBooking = artist.bookings[0]
            const date = new Date(nextBooking.slot.startTime).toLocaleDateString('pt-BR')
            const time = new Date(nextBooking.slot.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            responseText = `Você tem ${artist.bookings.length} agendamentos futuros próximos. O próximo é com ${nextBooking.client.name} em ${date} às ${time}.`
        }
    }
    else if (query.includes('cliente') || query.includes('quantos')) {
        // Count unique clients (Total)
        const totalClients = await prisma.booking.groupBy({
            by: ['clientId'],
            where: { artistId: artist.id }
        })
        responseText = `Você já atendeu ${totalClients.length} clientes únicos registrados no sistema.`
    }
    else if (query.includes('ola') || query.includes('oi') || query.includes('quem é você')) {
        responseText = `Olá ${artist.user.name?.split(' ')[0]}! Sou KAI, seu assistente pessoal no Kronos. Posso ajudar com dados financeiros, agenda ou dúvidas do estúdio.`
    }
    else {
        // Fallback: Busca na base FAQ (SImulada)
        const article = await prisma.helpArticle.findFirst({
            where: {
                keywords: { hasSome: query.split(' ') } // Busca tosca por keyword
            }
        })

        if (article) {
            responseText = `Encontrei algo sobre isso: ${article.content}`
        } else {
            responseText = "Ainda estou aprendendo sobre esse tópico. Tente perguntar sobre 'ganhos', 'clientes' ou consulte o FAQ."
        }
    }

    // Log Interaction
    await prisma.agentLog.create({
        data: {
            userId: session.user.id,
            query: userQuery,
            response: responseText,
            intent: 'MVP_RULE_BASED'
        }
    })

    return { text: responseText, role: 'KAI' }
}
