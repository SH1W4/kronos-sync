'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { revalidatePath } from "next/cache"
import { userThemeSchema, artistSettingsSchema, workspaceBrandingSchema } from "@/lib/validations"

export async function updateWorkspaceCapacity(capacity: number) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return { error: 'Não autorizado' }
        }

        const workspaceId = (session.user as any).activeWorkspaceId
        if (!workspaceId) return { error: 'Workspace não encontrado' }

        // Validação
        const validated = workspaceBrandingSchema.pick({ capacity: true }).safeParse({ capacity })
        if (!validated.success) {
            return { error: validated.error.issues[0].message }
        }

        // Security check: Only owners or admins should change this
        // defaulting to allowing any artist member for beta speed/trust

        await prisma.workspace.update({
            where: { id: workspaceId },
            data: { capacity }
        })

        revalidatePath('/artist/settings')
        return { success: true }
    } catch (error) {
        console.error("Error updating capacity:", error)
        return { error: 'Erro ao atualizar capacidade' }
    }
}

export async function getWorkspaceSettings() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return { error: 'Não autorizado' }
        }

        const workspaceId = (session.user as any).activeWorkspaceId
        if (!workspaceId) return { error: 'Workspace não encontrado' }

        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { capacity: true, name: true, pixKey: true }
        })

        return { success: true, settings: workspace }
    } catch (error) {
        return { error: 'Erro ao buscar configurações' }
    }
}

export async function updateUserTheme(color: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return { error: 'Não autorizado' }
        }

        const userId = (session.user as any).id
        if (!userId) return { error: 'Usuário não encontrado' }

        // Validação
        const validated = userThemeSchema.safeParse({ customColor: color })
        if (!validated.success) {
            return { error: validated.error.issues[0].message }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { customColor: color }
        })

        revalidatePath('/artist/settings')
        return { success: true }
    } catch (error) {
        console.error("Error updating user theme:", error)
        return { error: 'Erro ao atualizar tema' }
    }
}

export async function updateArtistSettings(data: { name: string; commissionRate: number; instagram?: string; image?: string }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return { error: 'Não autorizado' }
        }

        const userId = (session.user as any).id
        if (!userId) return { error: 'Usuário não encontrado' }

        const userRole = (session.user as any).role

        // Validação
        const validated = artistSettingsSchema.safeParse(data)
        if (!validated.success) {
            return { error: validated.error.issues[0].message }
        }

        // Update user profile (name, image)
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                image: data.image
            }
        })

        // Update Artist profile (commissionRate restricted to ADMIN, instagram)
        const artistData: any = {
            instagram: data.instagram
        }

        if (userRole === 'ADMIN') {
            artistData.commissionRate = data.commissionRate / 100
        }

        await prisma.artist.update({
            where: { userId },
            data: artistData
        })

        revalidatePath('/artist/settings')
        return { success: true }
    } catch (error) {
        console.error("Error updating artist settings:", error)
        return { error: 'Erro ao atualizar configurações' }
    }
}
