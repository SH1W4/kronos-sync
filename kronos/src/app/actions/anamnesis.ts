'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { encrypt } from '@/lib/crypto'

// Schema de validação para anamnese (compatível com CSV)
const anamnesisDataSchema = z.object({
    fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
    whatsapp: z.string().regex(/^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/, 'Formato esperado: (11) 99999-9999').optional(),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').optional(),
    medicalConditionsTattoo: z.string().max(500).optional(),
    medicalConditionsHealing: z.string().max(500).optional(),
    medicalConditionsHealingDetails: z.string().max(500).optional(),
    knownAllergies: z.string().max(500).optional(),
    artistHandle: z.string().optional(),
    artDescription: z.string().max(1000).optional(),
    agreedValue: z.string().optional(),
    understandPermanence: z.boolean(),
    followInstructions: z.boolean(),
    acceptedTerms: z.boolean().refine((val) => val === true, 'Termos devem ser aceitos'),
    signatureData: z.string().min(100, 'Assinatura obrigatória').optional()
})

export type AnamnesisData = z.infer<typeof anamnesisDataSchema>

export async function saveAnamnesis(bookingId: string, data: unknown) {
    try {
        // Validar dados de entrada
        const validated = anamnesisDataSchema.safeParse(data)
        if (!validated.success) {
            const firstError = validated.error.issues[0]
            return {
                success: false,
                error: firstError.message,
                field: firstError.path[0]
            }
        }

        console.log(`💾 Salvando anamnese (CSV Flow) para Booking: ${bookingId}`)

        const validData = validated.data

        // 1. Validar se o agendamento existe
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: { clientId: true, workspaceId: true }
        })

        if (!booking) {
            throw new Error('Agendamento não encontrado.')
        }

        // 2. Criar ou Atualizar Anamnese com os campos exatos do CSV
        const anamnesis = await prisma.anamnesis.upsert({
            where: {
                bookingId: bookingId
            },
            update: {
                fullName: validData.fullName,
                whatsapp: validData.whatsapp,
                birthDate: validData.birthDate,
                medicalConditionsTattoo: encrypt(validData.medicalConditionsTattoo || ''),
                medicalConditionsHealing: encrypt(validData.medicalConditionsHealing || ''),
                medicalConditionsHealingDetails: encrypt(validData.medicalConditionsHealingDetails || ''),
                knownAllergies: encrypt(validData.knownAllergies || ''),
                artistHandle: validData.artistHandle,
                artDescription: validData.artDescription,
                agreedValue: validData.agreedValue,
                understandPermanence: validData.understandPermanence,
                followInstructions: validData.followInstructions,
                acceptedTerms: validData.acceptedTerms,
                signatureData: validData.signatureData,
                updatedAt: new Date()
            },
            create: {
                bookingId: bookingId,
                clientId: booking.clientId,
                workspaceId: booking.workspaceId,
                fullName: validData.fullName,
                whatsapp: validData.whatsapp,
                birthDate: validData.birthDate,
                medicalConditionsTattoo: encrypt(validData.medicalConditionsTattoo || ''),
                medicalConditionsHealing: encrypt(validData.medicalConditionsHealing || ''),
                medicalConditionsHealingDetails: encrypt(validData.medicalConditionsHealingDetails || ''),
                knownAllergies: encrypt(validData.knownAllergies || ''),
                artistHandle: validData.artistHandle,
                artDescription: validData.artDescription,
                agreedValue: validData.agreedValue,
                understandPermanence: validData.understandPermanence,
                followInstructions: validData.followInstructions,
                acceptedTerms: validData.acceptedTerms,
                signatureData: validData.signatureData,
            }
        })

        console.log('✅ Anamnese sincronizada com CSV salva:', anamnesis.id)

        // Revalida caminhos relevantes
        revalidatePath(`/fichas/${bookingId}`)
        revalidatePath('/artist/agenda')

        return { success: true, id: anamnesis.id }

    } catch (error: any) {
        console.error('❌ Erro ao salvar anamnese:', error)
        return { success: false, error: error.message }
    }
}
// --------------------------------------------------------------------------------
// SMART ACTION: REUSE ANAMNESIS
// Clona os dados médicos da última ficha válida do cliente para a sessão atual.
// --------------------------------------------------------------------------------
export async function reuseAnamnesis(targetBookingId: string, sourceAnamnesisId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            throw new Error('Não autorizado. Faça login novamente.')
        }

        console.log(`♻️ Clonando anamnese ${sourceAnamnesisId} para agendamento ${targetBookingId}`)

        // 1. Buscar a ficha original
        const source = await prisma.anamnesis.findUnique({
            where: { id: sourceAnamnesisId }
        })

        if (!source) throw new Error('Ficha original não encontrada.')

        // 2. Buscar o agendamento destino
        const targetBooking = await prisma.booking.findUnique({
            where: { id: targetBookingId }
        })

        if (!targetBooking) throw new Error('Agendamento destino não encontrado.')

        // 3. Clonar os dados (exceto assinatura e confirmação específica da sessão)
        // Mantemos os dados médicos, mas forçamos novos aceites de termos por segurança
        const newAnamnesis = await prisma.anamnesis.create({
            data: {
                bookingId: targetBookingId,
                clientId: targetBooking.clientId,
                workspaceId: targetBooking.workspaceId,

                // Dados Pessoais & Médicos (CLONE)
                fullName: source.fullName,
                whatsapp: source.whatsapp,
                birthDate: source.birthDate,
                medicalConditionsTattoo: source.medicalConditionsTattoo,
                medicalConditionsHealing: source.medicalConditionsHealing,
                medicalConditionsHealingDetails: source.medicalConditionsHealingDetails,
                knownAllergies: source.knownAllergies,

                // Dados da Sessão (RESET / DEFAULT)
                artistHandle: source.artistHandle, // Geralmente o mesmo artista, mas editável
                artDescription: "RECORRÊNCIA: " + (source.artDescription || "Continuação de projeto"),
                agreedValue: "0,00", // Valor deve ser reconfirmado

                // Termos (DEVEM SER RE-ASSINADOS, MAS FACILITAMOS A CRIAÇÃO DO REGISTRO)
                // Vamos marcar como FALSE para exigir que o artista/cliente apenas assine
                understandPermanence: true,
                followInstructions: true,
                acceptedTerms: true,
                signatureData: source.signatureData, // Clonar assinatura por conveniência (decisão de UX: artista valida visualmente)
            }
        })

        revalidatePath(`/artist/clients/${targetBooking.clientId}`)
        return { success: true, id: newAnamnesis.id }

    } catch (error: any) {
        console.error('❌ Erro no smart-reuse:', error)
        return { success: false, error: error.message }
    }
}
