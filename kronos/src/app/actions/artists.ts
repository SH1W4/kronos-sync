'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function acceptArtistTerms() {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { success: false, message: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        })

        if (!user) return { success: false, message: 'Usuário não encontrado' }

        await prisma.artist.update({
            where: { userId: user.id },
            data: {
                termsAcceptedAt: new Date()
            }
        })

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error("Error accepting terms:", error)
        return { success: false, message: 'Erro ao processar aceite' }
    }
}

export async function checkTermsAcceptance() {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) return { accepted: true }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        })

        if (!user) return { accepted: true }

        const artist = await prisma.artist.findUnique({
            where: { userId: user.id },
            select: { termsAcceptedAt: true }
        })

        if (!artist) return { accepted: true } // Not an artist

        return { accepted: !!artist.termsAcceptedAt }
    } catch (error) {
        return { accepted: true } // Fail open to avoid blocking users if DB error
    }
}

export async function updateArtistCommission(artistId: string, newRate: number) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { success: false, message: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        })

        if (!user || user.role !== 'ADMIN') {
            return { success: false, message: 'Apenas administradores podem alterar comissões.' }
        }

        await prisma.artist.update({
            where: { id: artistId },
            data: { commissionRate: newRate / 100 }
        })

        revalidatePath('/artist/team')
        return { success: true }
    } catch (error) {
        console.error("Error updating commission:", error)
        return { success: false, message: 'Erro ao atualizar comissão' }
    }
}
