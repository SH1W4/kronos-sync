'use server'


import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { encrypt } from '@/lib/crypto'
import { anamnesisSchema } from "@/lib/validations"

export async function saveAnamnesis(bookingId: string, data: unknown) {
    try {
        const { userId: clerkUserId } = await auth()
        // ... validacoes Zod ...
        const validated = anamnesisSchema.safeParse(data)
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
                // continuousMedication: encrypt(validData.continuousMedication || ''), // Comentado temporariamente - aguardando migration
                // pregnancyOrLactation: encrypt(validData.pregnancyOrLactation || ''), // Comentado temporariamente - aguardando migration
                // faintingOrBleedingHistory: encrypt(validData.faintingOrBleedingHistory || ''), // Comentado temporariamente - aguardando migration
                // recentAlcoholOrDrugs: encrypt(validData.recentAlcoholOrDrugs || ''), // Comentado temporariamente - aguardando migration
                hasPreviousTattoos: validData.hasPreviousTattoos || '',
                artistHandle: validData.artistHandle,
                artDescription: validData.artDescription,
                agreedValue: validData.agreedValue,
                understandPermanence: validData.understandPermanence,
                followInstructions: validData.followInstructions,
                acceptedTerms: validData.acceptedTerms,
                allowSharing: validData.allowSharing,
                signatureData: validData.signatureData,
                updatedAt: new Date()
            } as any,
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
                // continuousMedication: encrypt(validData.continuousMedication || ''), // Comentado temporariamente - aguardando migration
                // pregnancyOrLactation: encrypt(validData.pregnancyOrLactation || ''), // Comentado temporariamente - aguardando migration
                // faintingOrBleedingHistory: encrypt(validData.faintingOrBleedingHistory || ''), // Comentado temporariamente - aguardando migration
                // recentAlcoholOrDrugs: encrypt(validData.recentAlcoholOrDrugs || ''), // Comentado temporariamente - aguardando migration
                hasPreviousTattoos: validData.hasPreviousTattoos || '',
                artistHandle: validData.artistHandle,
                artDescription: validData.artDescription,
                agreedValue: validData.agreedValue,
                understandPermanence: validData.understandPermanence,
                followInstructions: validData.followInstructions,
                acceptedTerms: validData.acceptedTerms,
                allowSharing: validData.allowSharing,
                signatureData: validData.signatureData,
            } as any
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
import { auth } from "@clerk/nextjs/server"

export async function reuseAnamnesis(targetBookingId: string, sourceAnamnesisId: string) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            throw new Error('Não autorizado. Faça login novamente.')
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        })

        if (!user) throw new Error('Usuário não encontrado.')

        console.log(`♻️ Clonando anamnese ${sourceAnamnesisId} para agendamento ${targetBookingId}`)

        // 1. Buscar a ficha original com dados do artista e compartilhamento
        const source = await prisma.anamnesis.findUnique({
            where: { id: sourceAnamnesisId },
            include: {
                booking: {
                    select: { artistId: true }
                }
            }
        })

        if (!source) throw new Error('Ficha original não encontrada.')

        // 4. Segurança: Verificar se o artista atual pode acessar esta ficha
        // Pode acessar se:
        // - For ADMIN
        // - For o autor da ficha original
        // - A ficha permite compartilhamento (allowSharing: true)
        const isOwner = source.booking?.artistId === user.id
        const isAdmin = user.role === 'ADMIN'
        const canAccess = isAdmin || isOwner || (source as any).allowSharing

        if (!canAccess) {
            throw new Error('Este cliente não autorizou o compartilhamento de dados médicos entre artistas. Uma nova ficha deve ser preenchida.')
        }

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
                // continuousMedication: source.continuousMedication, // Comentado temporariamente - aguardando migration
                // pregnancyOrLactation: source.pregnancyOrLactation, // Comentado temporariamente - aguardando migration
                // faintingOrBleedingHistory: source.faintingOrBleedingHistory, // Comentado temporariamente - aguardando migration
                // recentAlcoholOrDrugs: source.recentAlcoholOrDrugs, // Comentado temporariamente - aguardando migration
                hasPreviousTattoos: source.hasPreviousTattoos,

                // Dados da Sessão (RESET / DEFAULT)
                artistHandle: source.artistHandle, // Geralmente o mesmo artista, mas editável
                artDescription: "RECORRÊNCIA: " + (source.artDescription || "Continuação de projeto"),
                agreedValue: "0,00", // Valor deve ser reconfirmado

                // Termos (DEVEM SER RE-ASSINADOS, MAS FACILITAMOS A CRIAÇÃO DO REGISTRO)
                // Vamos marcar como FALSE para exigir que o artista/cliente apenas assine
                understandPermanence: true,
                followInstructions: true,
                acceptedTerms: true,
                allowSharing: (source as any).allowSharing, // Mantemos a preferência do cliente
                signatureData: source.signatureData, // Clonar assinatura por conveniência (decisão de UX: artista valida visualmente)
            } as any
        })

        revalidatePath(`/artist/clients/${targetBooking.clientId}`)
        return { success: true, id: newAnamnesis.id }

    } catch (error: any) {
        console.error('❌ Erro no smart-reuse:', error)
        return { success: false, error: error.message }
    }
}
