'use server'

import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

/**
 * Registra um acesso via QR Code.
 * @param type O tipo de scan (INVITE, COUPON, KIOSK)
 * @param targetId O ID do recurso (id do convite, id do cupom, ou id do workspace)
 * @param code O código textual (ex: "TATTOO10_JOAO")
 */
export async function trackQrScan(type: 'INVITE' | 'COUPON' | 'KIOSK', targetId: string, code?: string) {
    try {
        const headersList = await headers()
        const userAgent = headersList.get('user-agent') || 'Unknown'

        // Log detalhado para auditoria
        await prisma.qrScan.create({
            data: {
                type,
                targetId,
                code,
                userAgent,
            }
        })

        // Incremento de contadores rápidos (Atomic Update)
        if (type === 'INVITE') {
            await prisma.inviteCode.update({
                where: { id: targetId },
                data: { viewCount: { increment: 1 } }
            })
        } else if (type === 'COUPON') {
            await prisma.coupon.update({
                where: { id: targetId },
                data: { viewCount: { increment: 1 } }
            })
        }

        return { success: true }
    } catch (error) {
        // Falha no analytics não deve quebrar a experiência do usuário
        console.error('Failed to track QR scan accurately:', error)
        return { error: 'Tracking failed' }
    }
}
