'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type AnamnesisData = {
    medications: string
    allergies: string
    hepatitis: boolean
    hiv: boolean
    diabetes: boolean
    pregnant: boolean
    bleeding: boolean
    fainting: boolean
    notes: string
    agreedValue?: string | number
    projectDescription?: string
    signatureData?: string
}

export async function saveAnamnesis(bookingId: string, data: AnamnesisData) {
    try {
        console.log(`💾 Salvando anamnese para Booking: ${bookingId}`)

        // 1. Validar se o booking existe e pegar o ClientID
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: { clientId: true }
        })

        if (!booking) {
            throw new Error('Agendamento não encontrado.')
        }

        const numericValue = data.agreedValue ? Number(data.agreedValue) : null

        // 2. Upsert (Criar ou Atualizar) Anamnese
        const anamnesis = await prisma.anamnesis.upsert({
            where: {
                bookingId: bookingId
            },
            update: {
                // Novos Campos
                projectDescription: data.projectDescription,
                agreedValue: numericValue,
                signatureData: data.signatureData,
                acceptedTerms: true,

                // Campos de Saúde
                isUnderMedication: !!data.medications,
                medicationDetails: data.medications,
                hasAllergies: !!data.allergies,
                allergyDetails: data.allergies,

                // Mapeando booleanos genéricos para campos de condição (ajustar conforme schema real)
                hasMedicalCondition: data.hepatitis || data.hiv || data.diabetes || data.bleeding || data.fainting,
                conditionDetails: [
                    data.hepatitis ? 'Hepatite' : '',
                    data.hiv ? 'HIV' : '',
                    data.diabetes ? 'Diabetes' : '',
                    data.bleeding ? 'Coagulação' : '',
                    data.fainting ? 'Desmaios' : '',
                    data.notes
                ].filter(Boolean).join(', '),

                isPregnant: data.pregnant,

                updatedAt: new Date()
            },
            create: {
                bookingId: bookingId,
                clientId: booking.clientId,

                // Novos Campos
                projectDescription: data.projectDescription,
                agreedValue: numericValue,
                signatureData: data.signatureData,

                isUnderMedication: !!data.medications,
                medicationDetails: data.medications,
                hasAllergies: !!data.allergies,
                allergyDetails: data.allergies,

                hasMedicalCondition: data.hepatitis || data.hiv || data.diabetes || data.bleeding || data.fainting,
                conditionDetails: [
                    data.hepatitis ? 'Hepatite' : '',
                    data.hiv ? 'HIV' : '',
                    data.diabetes ? 'Diabetes' : '',
                    data.bleeding ? 'Coagulação' : '',
                    data.fainting ? 'Desmaios' : '',
                    data.notes
                ].filter(Boolean).join(', '),

                isPregnant: data.pregnant,
                acceptedTerms: true // Assumindo aceite ao salvar
            }
        })

        console.log('✅ Anamnese salva com sucesso:', anamnesis.id)

        revalidatePath(`/artist/anamnese/${bookingId}`)
        revalidatePath('/artist/dashboard')

        return { success: true, id: anamnesis.id }

    } catch (error: any) {
        console.error('❌ Erro ao salvar anamnese:', error)
        return { success: false, error: error.message }
    }
}
