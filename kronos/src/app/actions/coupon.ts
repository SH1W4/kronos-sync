'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from 'next/cache'

export async function generateReferralCode(clientId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { success: false, error: "Não autorizado" }

    // Verificar se já existe um cupom ativo
    const existing = await prisma.coupon.findFirst({
        where: { originClientId: clientId, status: 'ACTIVE' }
    })

    if (existing) {
        return { success: true, code: existing.code }
    }

    const client = await prisma.user.findUnique({ where: { id: clientId } })
    if (!client) return { success: false, error: "Cliente não encontrado" }

    const firstName = client.name?.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '') || 'CLIENT'
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    const code = `KAI-${firstName}-${random}`

    try {
        const coupon = await prisma.coupon.create({
            data: {
                code,
                discountPercent: 10,
                originClientId: clientId,
                status: 'ACTIVE'
            }
        })

        revalidatePath(`/artist/clients/${clientId}`)
        return { success: true, code: coupon.code }
    } catch (error) {
        return { success: false, error: "Erro ao gerar cupom" }
    }
}
