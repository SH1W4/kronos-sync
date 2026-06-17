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

export async function getArtistProfile() {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) return { error: 'Não autorizado' }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { name: true, image: true }
        })

        if (!user) return { error: 'Usuário não encontrado' }

        // Retorna nome e imagem do banco (fonte da verdade para o perfil)
        return { success: true, name: user.name, image: user.image }
    } catch (error) {
        console.error('Erro ao buscar perfil do artista:', error)
        return { error: 'Erro ao buscar perfil' }
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

        // Sanitizar dados
        const sanitizedData: any = { ...data }
        if (data.instagram !== undefined) {
            sanitizedData.instagram = data.instagram?.trim() || null
        }
        if (data.commissionRate !== undefined) {
            const parsedRate = typeof data.commissionRate === 'string' ? parseFloat(data.commissionRate) : Number(data.commissionRate)
            if (data.commissionRate === null || isNaN(parsedRate)) {
                delete sanitizedData.commissionRate
            } else {
                sanitizedData.commissionRate = parsedRate
            }
        }

        // Validação - Partial because we allow updating subsets
        const partialSchema = artistSettingsSchema.partial()
        const validated = partialSchema.safeParse(sanitizedData)
        if (!validated.success) {
            return { error: validated.error.issues[0].message }
        }

        const validData = validated.data

        // Update user profile (name, image) if provided
        // Nota: data.image pode ser string vazia para remover a foto — verificamos explicitamente com !== undefined
        if (validData.name !== undefined || data.image !== undefined) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    ...(validData.name !== undefined && { name: validData.name }),
                    ...(data.image !== undefined && { image: data.image || null })
                }
            })

            // Sincronizar com o Clerk para refletir no useUser() e evitar resets do webhook
            if (validData.name) {
                try {
                    const { clerkClient } = await import('@clerk/nextjs/server')
                    const names = validData.name.trim().split(/\s+/)
                    const firstName = names[0] || ''
                    const lastName = names.slice(1).join(' ') || ''
                    const client = await clerkClient()
                    await client.users.updateUser(clerkUserId, {
                        firstName,
                        lastName
                    })
                } catch (clerkErr) {
                    console.error("Erro ao sincronizar nome com Clerk:", clerkErr)
                }
            }
        }

        // Update Artist profile (commissionRate restricted to ADMIN, instagram, calendarSyncEnabled)
        const artistData: any = {}
        
        if (validData.instagram !== undefined) {
            artistData.instagram = validData.instagram
        }
        if (validData.calendarSyncEnabled !== undefined) {
            artistData.calendarSyncEnabled = validData.calendarSyncEnabled
        }

        if (userRole === 'ADMIN' && validData.commissionRate !== undefined && validData.commissionRate !== null) {
            artistData.commissionRate = validData.commissionRate / 100
        }

        await prisma.artist.update({
            where: { userId },
            data: artistData
        })

        revalidatePath('/artist/settings')
        revalidatePath('/artist/profile') // Garantir que a gamificação reflita a nova foto
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

export async function updateWorkspaceBranding(data: { name?: string; primaryColor?: string; logoUrl?: string }) {
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

        // Validação parcial
        const validated = workspaceBrandingSchema.pick({ name: true, primaryColor: true }).safeParse(data)
        if (!validated.success) {
            return { error: validated.error.issues[0].message }
        }

        await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.primaryColor && { primaryColor: data.primaryColor }),
                ...(data.logoUrl && { logoUrl: data.logoUrl })
            }
        })

        revalidatePath('/artist/settings')
        return { success: true }
    } catch (error) {
        console.error("Error updating branding:", error)
        return { error: 'Erro ao atualizar branding' }
    }
}

export async function updateWorkspaceCalendar(data: { googleCalendarId?: string }) {
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

        await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
                googleCalendarId: data.googleCalendarId
            }
        })

        revalidatePath('/artist/settings')
        return { success: true }
    } catch (error) {
        console.error("Error updating calendar:", error)
        return { error: 'Erro ao atualizar calendário' }
    }
}

// ─── Controle de Sincronização de Agenda ─────────────────────────────────────────

/**
 * Ativa ou desativa o espelho dos agendamentos do artista na agenda compartilhada do estúdio.
 * Eventos pessoais do Google Calendar do artista NUNCA bloqueiam a agenda do estúdio.
 */
export async function updateCalendarSync(enabled: boolean) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { artist: true }
        })

        if (!user?.artist) {
            return { error: 'Perfil de artista não encontrado' }
        }

        await prisma.artist.update({
            where: { id: user.artist.id },
            data: { calendarSyncEnabled: enabled }
        })

        revalidatePath('/artist/settings')
        return { success: true, calendarSyncEnabled: enabled }
    } catch (error) {
        console.error('Erro ao atualizar sync de agenda:', error)
        return { error: 'Erro ao salvar configuração de agenda' }
    }
}

export async function getCalendarSyncStatus() {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) return { error: 'Não autorizado' }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: {
                artist: { select: { calendarSyncEnabled: true } },
                memberships: {
                    include: {
                        workspace: { select: { googleCalendarId: true, name: true } }
                    }
                }
            }
        })

        if (!user?.artist) return { error: 'Artista não encontrado' }

        const workspace = user.memberships[0]?.workspace
        return {
            success: true,
            calendarSyncEnabled: user.artist.calendarSyncEnabled,
            studioCalendarConfigured: !!workspace?.googleCalendarId,
            studioName: workspace?.name
        }
    } catch (error) {
        return { error: 'Erro ao buscar status do sync' }
    }
}

// ─────────────────────────────────────────────────────────────────────────────

export async function updateWorkspacePix(data: { pixKey: string; pixRecipient: string }) {
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
        
        // Simples validação
        if (!data.pixKey || !data.pixRecipient) return { error: 'Dados incompletos' }

        await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
                pixKey: data.pixKey,
                pixRecipient: data.pixRecipient
            }
        })

        revalidatePath('/artist/settings')
        return { success: true }
    } catch (error) {
        console.error("Error updating pix:", error)
        return { error: 'Erro ao atualizar PIX' }
    }
}
