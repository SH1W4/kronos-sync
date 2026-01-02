'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { revalidatePath } from "next/cache"

export async function acceptArtistTerms() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, message: 'Não autorizado' }
        }

        await prisma.artist.update({
            where: { userId: session.user.id },
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
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return { accepted: true } // Not an artist session or not logged in

        const artist = await prisma.artist.findUnique({
            where: { userId: session.user.id },
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
        const session = await getServerSession(authOptions)
        if ((session?.user as any)?.role !== 'ADMIN') {
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
