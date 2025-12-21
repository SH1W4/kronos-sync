"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createSettlement(data: {
    artistId: string
    workspaceId: string
    bookingIds: string[]
    totalValue: number
    proofUrl: string
}) {
    try {
        const settlement = await prisma.settlement.create({
            data: {
                artistId: data.artistId,
                workspaceId: data.workspaceId,
                totalValue: data.totalValue,
                proofUrl: data.proofUrl,
                status: "PENDING",
                bookings: {
                    connect: data.bookingIds.map(id => ({ id }))
                }
            }
        })

        // Trigger AI Validation (Async)
        validateSettlementWithAI(settlement.id)

        revalidatePath('/artist/finance')
        return { success: true, settlementId: settlement.id }
    } catch (error) {
        console.error("Error creating settlement:", error)
        return { success: false, message: "Erro ao criar liquidação." }
    }
}

async function validateSettlementWithAI(settlementId: string) {
    try {
        console.log(`[AI] Starting validation for settlement ${settlementId}...`)

        await new Promise(resolve => setTimeout(resolve, 3000))

        const settlement = await prisma.settlement.findUnique({
            where: { id: settlementId },
            include: { bookings: true }
        })

        if (!settlement || !settlement.proofUrl) return

        const isMockValid = true
        const mockConfidence = 0.98

        if (isMockValid && mockConfidence > 0.95) {
            await prisma.settlement.update({
                where: { id: settlementId },
                data: {
                    status: "APPROVED",
                    aiConfidence: mockConfidence,
                    aiFeedback: "Comprovante validado com sucesso pela IA. Dados conferem.",
                    tokenData: {
                        glyphId: "GLYPH_SYNC_01",
                        points: 50,
                        rarity: "COMMON"
                    }
                }
            })
        } else {
            await prisma.settlement.update({
                where: { id: settlementId },
                data: {
                    status: "REVIEW",
                    aiConfidence: mockConfidence,
                    aiFeedback: "IA detectou possíveis discrepâncias. Requer revisão manual."
                }
            })
        }

    } catch (error) {
        console.error("AI Validation Error:", error)
    }
}

export async function getArtistPendingBookings(artistId: string) {
    try {
        const bookings = await prisma.booking.findMany({
            where: {
                artistId,
                status: "COMPLETED",
                settlementId: null
            },
            orderBy: {
                scheduledFor: 'desc'
            }
        })
        return bookings
    } catch (error) {
        console.error("Error fetching pending bookings:", error)
        return []
    }
}
