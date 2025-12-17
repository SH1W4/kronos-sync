'use server'

import { prisma } from '@/lib/prisma'
import { createCalendarEvent } from '@/lib/google'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

type BookingData = {
    date: Date
    startTime: string // HH:mm
    endTime: string // HH:mm
    clientName: string
    serviceType: string
    value: number
}

export async function createBooking(data: BookingData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new Error("Unauthorized")

    try {
        // 1. Identificar Artista e Slot (Simplificado: Criando Slot on the fly ou buscando)
        // Para este MVP, vamos buscar um slot existente ou criar um se a lógica de Slots for dinâmica.
        // O Schema tem "Slot" fixo? "macaId", "startTime", "endTime".
        // Vamos criar um Slot temporário para este booking.

        // Ajustar datas
        const [startHour, startMinute] = data.startTime.split(':').map(Number)
        const [endHour, endMinute] = data.endTime.split(':').map(Number)

        const startDateTime = new Date(data.date)
        startDateTime.setHours(startHour, startMinute, 0, 0)

        const endDateTime = new Date(data.date)
        endDateTime.setHours(endHour, endMinute, 0, 0)

        // Criar Slot
        const slot = await prisma.slot.create({
            data: {
                macaId: 1, // Default Maca 1
                startTime: startDateTime,
                endTime: endDateTime,
                isActive: true
            }
        })

        // Buscar Client ID (Criar se não existir pelo nome - Mockado por enquanto: Busca usuário CLIENT genérico ou cria)
        let client = await prisma.user.findFirst({ where: { role: 'CLIENT', name: data.clientName } })
        if (!client) {
            client = await prisma.user.create({
                data: {
                    name: data.clientName,
                    role: 'CLIENT',
                    email: `client-${Date.now()}@temp.com` // Email temporário
                }
            })
        }

        // Buscar Artista ID
        const artist = await prisma.artist.findUnique({ where: { userId: session.user.id } })
        if (!artist) throw new Error("Artist profile not found")

        // 2. Criar Booking no DB
        const booking = await prisma.booking.create({
            data: {
                artistId: artist.id,
                clientId: client.id,
                slotId: slot.id,
                value: data.value,
                finalValue: data.value,
                studioShare: data.value * 0.3, // 30% Studio
                artistShare: data.value * 0.7, // 70% Artist
                status: 'OPEN'
            }
        })

        console.log(`💾 Booking criado no DB: ${booking.id}`)

        // 3. Sincronizar com Google Agenda
        let googleEventId = null
        if (session.user.email?.includes('dev')) {
            console.log("🐛 Modo Dev: Pulando sync com Google Calendar real.")
        } else {
            console.log("🔄 Syncing com Google Calendar...")
            const googleResult = await createCalendarEvent(session.user.id, {
                summary: `Tatuagem: ${data.clientName}`,
                description: `Projeto: ${data.serviceType}`,
                startTime: startDateTime,
                endTime: endDateTime
            })

            if (googleResult.success && googleResult.eventId) {
                googleEventId = googleResult.eventId
                // Atualizar booking com ID do evento
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: { googleEventId }
                })
            }
        }

        revalidatePath('/artist/dashboard')
        revalidatePath('/artist/calendar')

        return { success: true, bookingId: booking.id }

    } catch (error: any) {
        console.error("❌ Erro ao criar agendamento:", error)
        return { success: false, error: error.message }
    }
}
