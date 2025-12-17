'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { revalidatePath } from "next/cache"
import { UserRole } from "@prisma/client"

function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'KRONOS-'
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

export async function createInvite(role: UserRole = "ARTIST", maxUses: number = 1) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return { success: false, error: "Não autorizado" }
    }

    const creator = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!creator) return { success: false, error: "Usuário não encontrado" }

    // TODO: Verificar permissões reais no futuro (Só Admin/Manager)

    const code = generateCode()

    try {
        const invite = await prisma.inviteCode.create({
            data: {
                code,
                role,
                maxUses,
                creatorId: creator.id,
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return []

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return []

    return await prisma.inviteCode.findMany({
        where: { creatorId: user.id },
        orderBy: { createdAt: 'desc' }
    })
}

export async function revokeInvite(id: string) {
    try {
        await prisma.inviteCode.update({
            where: { id },
            data: { isActive: false }
        })
        revalidatePath('/artist/invites')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erro ao revogar" }
    }
}
