'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { revalidatePath } from "next/cache"
import { UserRole, ArtistPlan } from "@prisma/client"
import { inviteSchema } from "@/lib/validations"

function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'KRONOS-'
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

export async function createInvite(options: {
    role: UserRole,
    targetPlan?: ArtistPlan,
    maxUses?: number,
    durationDays?: number,
    customCode?: string
}) {
    const session = await getServerSession(authOptions) as any

    if (!session?.user?.id || !session?.activeWorkspaceId) {
        return { success: false, error: "Não autorizado ou sem workspace ativo" }
    }

    // Validação Zod
    const validated = inviteSchema.safeParse(options)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    const { role, targetPlan, maxUses = 1, durationDays, customCode } = options

    const creator = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { artist: true }
    })

    if (!creator) return { success: false, error: "Usuário não encontrado" }

    // SEGURANÇA: Apenas ADMIN (Master) pode criar convites para Residentes ou outros Admins
    if ((targetPlan === 'RESIDENT' || role === 'ADMIN') && creator.role !== 'ADMIN') {
        return { success: false, error: "Apenas administradores podem convidar residentes ou novos admins" }
    }

    // Se tiver código personalizado, valida se já existe
    if (customCode) {
        const existing = await prisma.inviteCode.findUnique({ where: { code: customCode.toUpperCase() } })
        if (existing) return { success: false, error: "Este código personalizado já está em uso" }
    }

    const code = customCode ? customCode.toUpperCase() : generateCode()

    try {
        const invite = await prisma.inviteCode.create({
            data: {
                code,
                role,
                targetPlan,
                maxUses,
                durationDays,
                creatorId: creator.id,
                workspaceId: session.activeWorkspaceId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
            }
        })

        revalidatePath('/artist/invites')
        return { success: true, invite }
    } catch (error) {
        console.error(error)
        return { success: false, error: "Erro ao criar convite" }
    }
}

export async function getInvites() {
    const session = await getServerSession(authOptions) as any
    if (!session?.activeWorkspaceId) return []

    return await prisma.inviteCode.findMany({
        where: { workspaceId: session.activeWorkspaceId },
        orderBy: { createdAt: 'desc' }
    })
}

export async function revokeInvite(id: string) {
    const session = await getServerSession(authOptions) as any
    if (!session?.activeWorkspaceId) return { success: false, error: "Não autorizado" }

    try {
        await prisma.inviteCode.update({
            where: { id, workspaceId: session.activeWorkspaceId },
            data: { isActive: false }
        })
        revalidatePath('/artist/invites')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erro ao revogar" }
    }
}

/**
 * Busca detalhes de um convite pelo código
 */
export async function getInviteByCode(code: string) {
    try {
        const invite = await prisma.inviteCode.findUnique({
            where: { code: code.toUpperCase() },
            include: {
                workspace: {
                    select: {
                        name: true,
                        primaryColor: true,
                        logoUrl: true
                    }
                }
            }
        })

        if (!invite || !invite.isActive) {
            return { error: 'Convite inválido ou expirado.' }
        }

        if (invite.maxUses && invite.currentUses >= invite.maxUses) {
            return { error: 'Este convite já atingiu o limite de usos.' }
        }

        return { success: true, invite }
    } catch (e) {
        return { error: 'Erro ao validar convite.' }
    }
}
