'use server'

import { prisma } from '@/lib/prisma'

export async function validateCoupon(code: string) {
    try {
        if (!code) return { valid: false, message: 'Código não fornecido.' }

        // Caso especial: Cupons de Leads (KRONOS10_...)
        if (code.startsWith('KRONOS10_')) {
            return {
                valid: true,
                discountPercent: 10,
                code: code,
                type: 'LEAD_GEN'
            }
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code },
            include: { artist: true }
        })

        if (!coupon || coupon.status !== 'ACTIVE') {
            return { valid: false, message: 'Cupom inválido ou expirado.' }
        }

        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            return { valid: false, message: 'Cupom expirado.' }
        }

        return {
            valid: true,
            discountPercent: coupon.discountPercent,
            code: coupon.code,
            artistId: coupon.artistId,
            type: 'OFFICIAL'
        }
    } catch (error) {
        return { valid: false, message: 'Erro ao validar cupom.' }
    }
}

export async function applyCommissionToArtist(orderId: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                coupon: {
                    include: { artist: true }
                }
            }
        })

        if (!order || !order.coupon?.artistId) return

        const commissionAmount = order.finalTotal * 0.05 // 5% comissão estratégica

        // Aqui poderíamos atualizar uma tabela de Financeiro ou o próprio saldo do artista
        // Por enquanto, vamos apenas garantir que a relação existe
        console.log(`Applying ${commissionAmount} commission to Artist ${order.coupon.artistId} for Order ${orderId}`)

        // No futuro: await prisma.commission.create(...)
    } catch (error) {
        console.error('Error applying commission:', error)
    }
}
