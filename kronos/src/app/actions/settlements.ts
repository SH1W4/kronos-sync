"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import Tesseract from "tesseract.js"

export async function createSettlement(data: {
    artistId: string
    workspaceId: string
    bookingIds: string[]
    orderIds?: string[]
    totalValue: number // Esse valor já vem deduzido no front-end para o artista
    bonusDeduction?: number // Valor total de bônus abatidos nesta liquidação
    proofUrl: string
}) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { success: false, message: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { artist: true }
        })

        if (!user) {
            return { success: false, message: 'Usuário não encontrado.' }
        }

        if (user.role !== 'ADMIN' && user.artist?.id !== data.artistId) {
            return { success: false, message: 'Você só pode criar liquidações para seu próprio perfil.' }
        }

        if (user.role !== 'ADMIN' && user.artist?.workspaceId && user.artist.workspaceId !== data.workspaceId) {
            return { success: false, message: 'Workspace inválido para este artista.' }
        }

        if (data.bookingIds.length === 0 && (data.orderIds || []).length === 0) {
            return { success: false, message: 'Selecione ao menos um item para liquidar.' }
        }

        const validBookings = await prisma.booking.findMany({
            where: {
                id: { in: data.bookingIds },
                artistId: data.artistId,
                settlementId: null
            }
        })

        if (validBookings.length !== data.bookingIds.length) {
            return { success: false, message: 'Alguns agendamentos não podem ser liquidados.' }
        }

        let validOrders: any[] = []
        if (data.orderIds?.length) {
            validOrders = await prisma.order.findMany({
                where: {
                    id: { in: data.orderIds },
                    settlementId: null,
                    status: 'PAID',
                    items: {
                        every: {
                            product: {
                                artistId: data.artistId
                            }
                        }
                    }
                }
            })

            if (validOrders.length !== data.orderIds.length) {
                return { success: false, message: 'Alguns pedidos não podem ser liquidados.' }
            }
        }

        const settlement = await prisma.settlement.create({
            data: {
                artistId: data.artistId,
                workspaceId: data.workspaceId,
                totalValue: data.totalValue,
                proofUrl: data.proofUrl,
                status: "PENDING",
                bookings: {
                    connect: data.bookingIds.map(id => ({ id }))
                },
                orders: {
                    connect: (data.orderIds || []).map(id => ({ id }))
                } as any,
                // Registramos o abatimento nos metadados da liquidação se houver
                aiExtractedData: data.bonusDeduction ? { bonusDeducted: data.bonusDeduction } : undefined
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

        const settlement = await prisma.settlement.findUnique({
            where: { id: settlementId },
            include: {
                bookings: true,
                workspace: true
            }
        })

        if (!settlement || !settlement.proofUrl) return

        const workspace = settlement.workspace
        const studioName = workspace?.name || "Kairøs Studio"
        const studioPixRecipient = workspace?.pixRecipient || studioName

        let extractedText = ''
        let ocrConfidence = 0.50

        try {
            console.log(`[OCR] Executing Tesseract on ${settlement.proofUrl}`)
            const { data } = await Tesseract.recognize(
                settlement.proofUrl,
                'por' // Português
            )
            extractedText = data.text || ''
            ocrConfidence = data.confidence ? data.confidence / 100 : 0.60
            console.log(`[OCR Success] Extracted text length: ${extractedText.length}, Confidence: ${ocrConfidence}`)
        } catch (ocrError) {
            console.error('[OCR Fallback] Tesseract failed, using fallback heuristic:', ocrError)
            extractedText = ''
            ocrConfidence = 0.50
        }

        // 1. AI Logic: Check if proof URL matches Studio identity
        const textLower = extractedText.toLowerCase()
        const studioTerms = [
            studioName.toLowerCase(),
            studioPixRecipient.toLowerCase(),
            'kronos',
            'galeria'
        ].filter(Boolean)

        const isStudioRecipient = studioTerms.some(term => textLower.includes(term))

        // Check if value matches
        const valueStr = settlement.totalValue.toFixed(2)
        const valueCommaStr = valueStr.replace('.', ',')
        const valueIntStr = Math.round(settlement.totalValue).toString()

        const isValueMatch = textLower.includes(valueStr) || 
                             textLower.includes(valueCommaStr) || 
                             textLower.includes(valueIntStr)

        console.log(`[AI Evaluation] Recipient Match: ${isStudioRecipient}, Value Match: ${isValueMatch}, OCR Confidence: ${ocrConfidence}`)

        // 2. Trust Score Algorithm
        let aiConfidence = 0.0
        if (ocrConfidence > 0.8 && isStudioRecipient && isValueMatch) {
            aiConfidence = 0.99
        } else if (ocrConfidence > 0.6 && (isStudioRecipient || isValueMatch)) {
            aiConfidence = 0.65
        } else {
            aiConfidence = 0.30
        }

        // Auto-approval enabled for high confidence (>= 0.90)
        if (aiConfidence >= 0.90) {
            await prisma.settlement.update({
                where: { id: settlementId },
                data: {
                    status: "APPROVED",
                    aiConfidence,
                    aiFeedback: `✨ Sincronia Perfeita. Comprovante validado autonomamente: R$ ${settlement.totalValue.toFixed(2)} para ${studioName}. OCR: ${(ocrConfidence * 100).toFixed(0)}%`,
                    tokenData: {
                        glyphId: "GLYPH_SYNC_KAI",
                        points: 100,
                        rarity: "EPIC"
                    }
                }
            })

            // Decrementar bônus do artista se houver abatimento nessa liquidação auto-aprovada
            if (settlement.aiExtractedData) {
                const metaData = settlement.aiExtractedData as any
                if (metaData.bonusDeducted > 0) {
                    await prisma.artist.update({
                        where: { id: settlement.artistId },
                        data: { monthlyEarnings: { decrement: metaData.bonusDeducted } }
                    })
                    console.log(`[AI] Bônus de R$ ${metaData.bonusDeducted} decrementado com sucesso do saldo do artista ${settlement.artistId}`)
                }
            }
            console.log(`[AI] Settlement ${settlementId} APPROVED autonomamente.`)
        } else {
            const reason = `Discrepâncias: ${!isStudioRecipient ? `Destinatário não encontrado no comprovante` : ''} ${!isValueMatch ? `Valor R$ ${settlement.totalValue.toFixed(2)} não localizado` : ''} ${ocrConfidence < 0.7 ? `Confiança baixa (${(ocrConfidence * 100).toFixed(0)}%)` : ''}`.trim()
            
            await prisma.settlement.update({
                where: { id: settlementId },
                data: {
                    status: "REVIEW",
                    aiConfidence,
                    aiFeedback: reason || "Confiança insuficiente para auto-aprovação"
                }
            })
            console.log(`[AI] Settlement ${settlementId} flagged for REVIEW (Confidence: ${aiConfidence}).`)
        }

    } catch (error) {
        console.error("AI Autonomous Validation Error:", error)
    }
}

export async function getArtistPendingRevenue(artistId: string) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { error: 'Não autorizado', bookings: [], orders: [], availableBonus: 0 }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { artist: true }
        })

        if (!user) {
            return { error: 'Usuário não encontrado', bookings: [], orders: [], availableBonus: 0 }
        }

        if (user.role !== 'ADMIN' && user.artist?.id !== artistId) {
            return { error: 'Não autorizado', bookings: [], orders: [], availableBonus: 0 }
        }

        const bookings = await prisma.booking.findMany({
            where: {
                artistId,
                status: "COMPLETED",
                settlementId: null
            },
            include: {
                client: true,
                slot: true
            },
            orderBy: {
                scheduledFor: 'desc'
            }
        })

        const orders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        product: { artistId }
                    }
                },
                settlementId: null,
                status: 'PAID'
            },
            include: {
                client: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        }) as any

        // NEW: Fetch accumulated bonuses (monthlyEarnings) for this artist
        const artist = await prisma.artist.findUnique({
            where: { id: artistId },
            select: { monthlyEarnings: true }
        })

        return { bookings, orders, availableBonus: artist?.monthlyEarnings || 0 }
    } catch (error) {
        console.error("Error fetching pending revenue:", error)
        return { bookings: [], orders: [], availableBonus: 0 }
    }
}

export async function approveSettlement(settlementId: string, status: 'APPROVED' | 'REJECTED') {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { success: false, message: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        })

        if (!user || user.role !== 'ADMIN') {
            return { success: false, message: 'Apenas administradores podem aprovar liquidações.' }
        }

        const settlement = await prisma.settlement.update({
            where: { id: settlementId },
            data: { status },
            include: { artist: true }
        })

        // Se a liquidação for aprovada, e houver bônus abatidos, resetamos os ganhos do artista
        if (status === 'APPROVED' && settlement.aiExtractedData) {
            const data = settlement.aiExtractedData as any
            if (data.bonusDeducted > 0) {
                await prisma.artist.update({
                    where: { id: settlement.artistId },
                    data: { monthlyEarnings: { decrement: data.bonusDeducted } }
                })
                console.log(`📉 Bônus de R$ ${data.bonusDeducted} formalmente abatido do saldo do artista ${settlement.artistId}`)
            }
        }

        revalidatePath('/artist/finance')
        return { success: true }
    } catch (error) {
        console.error("Error approving settlement:", error)
        return { success: false, message: "Erro ao atualizar status." }
    }
}

export async function auditSettlement(settlementId: string) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { success: false, message: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        })

        if (!user || user.role !== 'ADMIN') {
            return { success: false, message: 'Apenas administradores podem auditar liquidações.' }
        }

        await prisma.settlement.update({
            where: { id: settlementId },
            data: { isAudited: true } as any
        })
        revalidatePath('/artist/finance')
        return { success: true }
    } catch (error) {
        console.error("Error auditing settlement:", error)
        return { success: false, message: "Erro ao auditar liquidação." }
    }
}
