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
                where: { status: 'COMPLETED' }
            }
        }
    })

    if (!artist) return { text: "Não encontrei seu perfil de artista.", role: 'KAI' }

    // 2. Lógica de Resposta baseada em Regras (MVP do RAG)
    let responseText = ""

    if (query.includes('ganho') || query.includes('faturei') || query.includes('financeiro')) {
        const total = artist.bookings.reduce((acc, b) => acc + (b.artistShare || 0), 0)
        responseText = `Com base nos seus registros, você acumulou um total de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)} em comissões recebidas.`
    }
    else if (query.includes('cliente') || query.includes('quantos')) {
        // Count unique clients
        const uniqueClients = new Set(artist.bookings.map(b => b.clientId)).size
        responseText = `Você já atendeu ${uniqueClients} clientes únicos registrados no sistema.`
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
