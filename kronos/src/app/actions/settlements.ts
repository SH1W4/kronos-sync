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
        console.log(`[AI] Starting autonomous validation for settlement ${settlementId}...`)

        // Simulate Neural Processing time
        await new Promise(resolve => setTimeout(resolve, 4000))

        const settlement = await prisma.settlement.findUnique({
            where: { id: settlementId },
            include: {
                bookings: true,
                workspace: true
            }
        })

        if (!settlement || !settlement.proofUrl) return

        // 1. AI Logic: Check if proof URL matches Studio identity (Mocking Vision Agent)
        const workspace = settlement.workspace
        const studioName = workspace?.name || "Kronos Studio"
        const studioPixRecipient = workspace?.pixRecipient || studioName

        // Simulating OCR extraction from Comprovante
        // For testing/mock purposes, we assume the AI "sees" the correct recipient
        const extractedValue = settlement.totalValue
        const extractedDestinatario = studioPixRecipient

        console.log(`[AI] Extracted Value: ${extractedValue}, Destinatário: ${extractedDestinatario}`)

        // 2. Trust Score Algorithm: Recipient must be the Studio
        const isStudioRecipient = extractedDestinatario.toLowerCase().includes(studioName.toLowerCase()) ||
            extractedDestinatario.toLowerCase().includes(studioPixRecipient.toLowerCase())

        const isValueMatch = Math.abs(extractedValue - settlement.totalValue) < 0.01

        // High confidence only if paying the STUDIO
        const aiConfidence = isStudioRecipient && isValueMatch ? 0.99 : 0.45

        if (aiConfidence > 0.90) {
            await prisma.settlement.update({
                where: { id: settlementId },
                data: {
                    status: "APPROVED",
                    aiConfidence,
                    aiFeedback: `Sincronia Perfeita ✨. Comprovante de comissão validado para o estúdio: ${studioName}.`,
                    tokenData: {
                        glyphId: "GLYPH_SYNC_KAI",
                        points: 100,
                        rarity: "EPIC"
                    }
                }
            })
            console.log(`[AI] Settlement ${settlementId} APPROVED autonomamente para o estúdio.`)
        } else {
            await prisma.settlement.update({
                where: { id: settlementId },
                data: {
                    status: "REVIEW",
                    aiConfidence,
                    aiFeedback: `Discrepância detectada. O destinatário esperado era o estúdio (${studioName}), mas a IA não pôde confirmar.`
                }
            })
            console.log(`[AI] Settlement ${settlementId} flagged for REVIEW (Studio mismatch).`)
        }

    } catch (error) {
        console.error("AI Autonomous Validation Error:", error)
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
