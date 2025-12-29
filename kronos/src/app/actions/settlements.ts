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

        // TODO: Replace with real OCR when Tesseract is fully integrated
        const ocrConfidence = 0.95 // Mock confidence for now

        // Combine OCR confidence with business logic
        let aiConfidence = 0.0
        if (ocrConfidence > 0.8 && isStudioRecipient && isValueMatch) {
            aiConfidence = 0.99
        } else if (ocrConfidence > 0.6 && (isStudioRecipient || isValueMatch)) {
            aiConfidence = 0.65
        } else {
            aiConfidence = 0.30
        }

        // SAFETY: Auto-approval disabled until OCR is fully integrated
        // All settlements will go to REVIEW for manual verification
        if (aiConfidence > 1.0) { // Threshold set to impossible value (100%+)
            await prisma.settlement.update({
                where: { id: settlementId },
                data: {
                    status: "APPROVED",
                    aiConfidence,
                    aiFeedback: `✨ Sincronia Perfeita. Comprovante validado: R$ ${extractedValue.toFixed(2)} para ${studioName}. OCR: ${(ocrConfidence * 100).toFixed(0)}%`,
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
                    aiFeedback: `Discrepâncias: ${!isStudioRecipient ? `Destinatário "${extractedDestinatario}" ≠ estúdio` : ''} ${!isValueMatch ? `Valor R$ ${extractedValue.toFixed(2)} ≠ R$ ${settlement.totalValue.toFixed(2)}` : ''} ${ocrConfidence < 0.7 ? `OCR baixo (${(ocrConfidence * 100).toFixed(0)}%)` : ''}`.trim()
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

export async function approveSettlement(settlementId: string, status: 'APPROVED' | 'REJECTED') {
    try {
        await prisma.settlement.update({
            where: { id: settlementId },
            data: { status }
        })
        revalidatePath('/artist/finance')
        return { success: true }
    } catch (error) {
        console.error("Error approving settlement:", error)
        return { success: false, message: "Erro ao atualizar status." }
    }
}
