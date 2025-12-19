'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { revalidatePath } from "next/cache"

/**
 * Updates artist profile settings
 */
export async function updateArtistSettings(data: {
    name?: string
    commissionRate?: number
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { artist: true }
        })

        if (!user?.artist) {
            return { error: 'Artista não encontrado' }
        }

        await prisma.$transaction([
            // Update User name
            ...(data.name ? [
                prisma.user.update({
                    where: { id: user.id },
                    data: { name: data.name }
                })
            ] : []),
            // Update Artist record
            prisma.artist.update({
                where: { id: user.artist.id },
                data: {
                    ...(data.commissionRate !== undefined && { commissionRate: data.commissionRate / 100 })
                }
            })
        ])

        revalidatePath('/artist/settings')
        return { success: true }

    } catch (error) {
        console.error('Error updating artist settings:', error)
        return { error: 'Erro ao salvar configurações' }
    }
}
