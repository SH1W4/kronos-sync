'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function registerCompanionLead(data: {
    name: string
    phone: string
    instagram?: string
    barrier?: string
    intent?: string
    artistPin: string
    marketingOptIn: boolean
}) {
    try {
        // 1. Validar PIN do Artista e Pegar Artista
        // O PIN é composto pelos últimos 4 dígitos do telefone do artista
        const artist = await prisma.artist.findFirst({
            where: {
                user: {
                    phone: {
                        endsWith: data.artistPin
                    }
                }
            },
            select: { id: true, workspaceId: true }
        })

        if (!artist) {
            throw new Error('PIN do Artista inválido. Peça o código correto ao tatuador.')
        }

        // 2. Anti-Fraude: Verificar se o WhatsApp é de um cliente ativo hoje
        // Ou se já possui tatuagem/agendamento (Foco em "Primeira Tattoo")
        const today = new Date()
        const startOfDay = new Date(today.setHours(0, 0, 0, 0))
        const endOfDay = new Date(today.setHours(23, 59, 59, 999))

        const existingRecord = await prisma.booking.findFirst({
            where: {
                client: {
                    phone: data.phone
                }
            }
        })

        if (existingRecord) {
            return {
                success: false,
                isClient: true,
                message: "Vimos que você já faz parte da nossa elite! Esse INK PASS é exclusivo para quem ainda não tem a primeira arte com o KRONØS."
            }
        }

        // 3. Salvar o Lead no KioskEntry
        const lead = await (prisma.kioskEntry as any).create({
            data: {
                name: data.name,
                phone: data.phone,
                instagram: data.instagram,
                barrier: data.barrier,
                intent: data.intent,
                type: 'COMPANION',
                marketingOptIn: data.marketingOptIn,
                artistId: artist.id,
                workspaceId: artist.workspaceId
            }
        })

        // 4. Gerar Cupom de Boas-Vindas (Focado em Tattoo)
        const couponCode = `TATTOO10_${data.name.split(' ')[0].toUpperCase()}`

        return {
            success: true,
            couponCode,
            message: "Sincronização Completa! Seu INK PASS de 10% na primeira tattoo foi ativado."
        }
    } catch (error: any) {
        console.error('Error registering lead:', error)
        return { success: false, message: error.message || 'Erro ao registrar lead.' }
    }
}
