'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type AnamnesisData = {
    fullName?: string
    whatsapp?: string
    birthDate?: string
    medicalConditionsTattoo?: string
    medicalConditionsHealing?: string
    medicalConditionsHealingDetails?: string
    knownAllergies?: string
    artistHandle?: string
    artDescription?: string
    agreedValue?: string
    understandPermanence: boolean
    followInstructions: boolean
    acceptedTerms: boolean
    signatureData?: string
}

export async function saveAnamnesis(bookingId: string, data: AnamnesisData) {
    try {
        console.log(`💾 Salvando anamnese (CSV Flow) para Booking: ${bookingId}`)

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
                fullName: data.fullName,
                whatsapp: data.whatsapp,
                birthDate: data.birthDate,
                medicalConditionsTattoo: data.medicalConditionsTattoo,
                medicalConditionsHealing: data.medicalConditionsHealing,
                medicalConditionsHealingDetails: data.medicalConditionsHealingDetails,
                knownAllergies: data.knownAllergies,
                artistHandle: data.artistHandle,
                artDescription: data.artDescription,
                agreedValue: data.agreedValue,
                understandPermanence: data.understandPermanence,
                followInstructions: data.followInstructions,
                acceptedTerms: data.acceptedTerms,
                signatureData: data.signatureData,
                updatedAt: new Date()
            },
            create: {
                bookingId: bookingId,
                clientId: booking.clientId,
                workspaceId: booking.workspaceId,
                fullName: data.fullName,
                whatsapp: data.whatsapp,
                birthDate: data.birthDate,
                medicalConditionsTattoo: data.medicalConditionsTattoo,
                medicalConditionsHealing: data.medicalConditionsHealing,
                medicalConditionsHealingDetails: data.medicalConditionsHealingDetails,
                knownAllergies: data.knownAllergies,
                artistHandle: data.artistHandle,
                artDescription: data.artDescription,
                agreedValue: data.agreedValue,
                understandPermanence: data.understandPermanence,
                followInstructions: data.followInstructions,
                acceptedTerms: data.acceptedTerms,
                signatureData: data.signatureData,
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
