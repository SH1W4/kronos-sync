'use server'

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export type KaiAnalysisResult = {
    success: boolean
    suggestions?: {
        bio: string
        primaryColor: string
        secondaryColor: string
        styleTags: string[]
        specialty: string
    }
    error?: string
}

export async function analyzeInstagramProfile(handle: string): Promise<KaiAnalysisResult> {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { success: false, error: "Não autorizado" }

    // Simulação de processamento de IA (KAI Engine)
    // Em produção, isso bateria em uma API de Visão Computacional ou LLM analizando metadados/OCR de posts
    await new Promise(resolve => setTimeout(resolve, 2500)) // Simula latência da IA

    const handleClean = handle.replace('@', '').toLowerCase()

    // Lógica determinística para demo baseada no handle
    let suggestions = {
        bio: "Artista apaixonado por transformar histórias em arte na pele. Especialista em traços finos e composições autorais.",
        primaryColor: "#8B5CF6", // Purple
        secondaryColor: "#D8B4FE",
        styleTags: ["Fine Line", "Blackwork", "Autorais"],
        specialty: "Fine Line & Blackwork"
    }

    if (handleClean.includes('dark') || handleClean.includes('ink')) {
        suggestions = {
            bio: "Explorando as sombras e o contraste através do Blackwork intenso. Foco em anatomia e fluidez.",
            primaryColor: "#111827", // Gray-900
            secondaryColor: "#374151",
            styleTags: ["Dark Art", "Blackwork", "Heavy Contrast"],
            specialty: "Dark Blackwork"
        }
    } else if (handleClean.includes('color') || handleClean.includes('neo')) {
        suggestions = {
            bio: "Vibratibilidade e cores sólidas. Criando universos coloridos através do New School e Neo Traditional.",
            primaryColor: "#EF4444", // Red
            secondaryColor: "#F59E0B", // Amber
            styleTags: ["Neo Trad", "Color Full", "New School"],
            specialty: "Neo Traditional"
        }
    }

    return {
        success: true,
        suggestions
    }
}

export async function applyKaiBranding(data: {
    bio: string
    primaryColor: string
    styleTags: string[]
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { success: false, error: "Não autorizado" }

    try {
        // Aqui atualizaríamos o perfil do artista no DB
        // Nota: O schema atual não tem bio ou primaryColor explicitamente na tabela Artist
        // Precisaríamos adicionar ou salvar em um campo de 'metadata'

        // Simulação por enquanto para não quebrar o schema na demo
        console.log("Applying branding:", data)

        return { success: true }
    } catch (e) {
        return { success: false, error: "Falha ao aplicar branding" }
    }
}
