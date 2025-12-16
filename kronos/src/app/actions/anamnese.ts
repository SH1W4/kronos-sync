"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveAnamnesis(bookingId: string, clientId: string, formData: any) {
    try {
        // Criar ou atualizar a ficha
        const anamnese = await prisma.anamnesis.create({
            data: {
                bookingId,
                clientId,
                hasMedicalCondition: formData.condicaoMedica,
                conditionDetails: formData.detalhesCondicao,
                hasHealingIssues: formData.cicatrizacao,
                healingDetails: formData.detalhesCicatrizacao,
                hasAllergies: formData.alergias,
                allergyDetails: formData.detalhesAlergias,
                acceptedTerms: formData.termos,
                signatureData: "DIGITAL_SIGNATURE_V1", // Placeholder para futura assinatura canvas
                projectDescription: "Tatuagem Personalizada", // Padrão por enquanto
            }
        })

        // Atualizar status do Booking
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                fichaStatus: "COMPLETED",
                fichaUrl: `/artist/anamnese/${bookingId}` // Link para ver no futuro
            }
        })

        revalidatePath(`/artist/dashboard`)
        return { success: true }

    } catch (error) {
        console.error("Erro ao salvar anamnese:", error)
        return { success: false, error: "Falha ao salvar no banco de dados." }
    }
}
