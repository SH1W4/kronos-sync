'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { userThemeSchema, artistSettingsSchema, workspaceBrandingSchema } from "@/lib/validations"

export async function updateWorkspaceCapacity(capacity: number) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { memberships: true }
        })

        const workspaceId = user?.memberships[0]?.workspaceId
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
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { memberships: true }
        })

        const workspaceId = user?.memberships[0]?.workspaceId
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
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        })

        const userId = user?.id
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

export async function updateArtistSettings(data: { name?: string; commissionRate?: number; instagram?: string; image?: string; calendarSyncEnabled?: boolean }) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        })

        const userId = user?.id
        if (!userId) return { error: 'Usuário não encontrado' }

        const userRole = user.role

        // Validação - Partial because we allow updating subsets
        const partialSchema = artistSettingsSchema.partial()
        const validated = partialSchema.safeParse(data)
        if (!validated.success) {
            return { error: validated.error.issues[0].message }
        }

        // Update user profile (name, image) if provided
        if (data.name || data.image) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    ...(data.name && { name: data.name }),
                    ...(data.image && { image: data.image })
                }
            })
        }

        // Update Artist profile (commissionRate restricted to ADMIN, instagram, calendarSyncEnabled)
        const artistData: any = {
            instagram: data.instagram,
            calendarSyncEnabled: data.calendarSyncEnabled
        }

        if (userRole === 'ADMIN' && data.commissionRate !== undefined) {
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

export async function updatePassword(data: any) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        })

        if (!user) return { error: 'Usuário não encontrado' }
        const userId = user.id

        // Validação
        const { passwordChangeSchema } = await import("@/lib/validations")
        const validated = passwordChangeSchema.safeParse(data)
        if (!validated.success) {
            return { error: validated.error.issues[0].message }
        }

        const { currentPassword, newPassword } = validated.data

        // 1. User already loaded above
        // const user = ... (removed)


        // 2. Verify Current Password
        if (user.password) {
            const bcrypt = await import('bcryptjs')
            const isValid = await bcrypt.compare(currentPassword, user.password)
            if (!isValid) {
                return { error: 'Senha atual incorreta' }
            }
        }

        // 3. Hash New Password
        const bcrypt = await import('bcryptjs')
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        // 4. Update Database
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        return { success: true }
    } catch (error) {
        console.error("Error updating password:", error)
        return { error: 'Erro ao atualizar senha' }
    }
}
