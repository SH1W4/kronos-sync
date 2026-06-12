'use server'

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

// Schema validation for Kiosk Booking
const kioskBookingSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório (mínimo 2 caracteres)"),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  artistId: z.string().min(1, "Selecione um artista"),
  scheduledFor: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida"),
  duration: z.number().min(30, "Duração mínima é de 30 minutos").max(480, "Duração máxima de 8 horas"),
  type: z.string().min(2, "Tipo de trabalho é obrigatório"),
  notes: z.string().optional(),
  honeypot: z.string().optional(),
}).refine((data) => {
  const hasPhone = data.phone && data.phone.trim().length > 0;
  const hasInstagram = data.instagram && data.instagram.trim().length > 0;
  return hasPhone || hasInstagram;
}, {
  message: "Forneça pelo menos um meio de contato: Instagram ou Telefone",
  path: ["instagram"],
});

/**
 * Retrieve all active artists associated with a workspace for the Kiosk selection.
 */
export async function getKioskArtists() {
  try {
    const artists = await prisma.artist.findMany({
      where: {
        isActive: true,
        workspaceId: { not: null }
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          }
        },
        workspace: {
          select: {
            id: true,
            name: true,
            primaryColor: true,
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    })

    return { success: true, artists }
  } catch (error) {
    console.error('Error fetching kiosk artists:', error)
    return { success: false, error: 'Erro ao buscar artistas do estúdio' }
  }
}

/**
 * Calculates available time slots for a specific artist on a given date.
 * Business hours: 09:00 to 20:00 (America/Sao_Paulo).
 */
export async function getKioskAvailableSlots(artistId: string, dateStr: string, durationMin: number) {
  try {
    if (!artistId || !dateStr) {
      return { success: false, error: 'Dados insuficientes' }
    }

    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
      include: { workspace: true }
    })

    if (!artist || !artist.workspaceId || !artist.workspace) {
      return { success: false, error: 'Artista ou Workspace não encontrado' }
    }

    const workspace = artist.workspace
    const capacity = workspace.capacity || 3

    // Fetch all bookings for the artist on the selected date
    const dayStart = new Date(`${dateStr}T00:00:00-03:00`)
    const dayEnd = new Date(`${dateStr}T23:59:59-03:00`)

    // All active bookings for the artist today
    const artistBookings = await prisma.booking.findMany({
      where: {
        artistId,
        status: { in: ['OPEN', 'CONFIRMED', 'COMPLETED'] },
        scheduledFor: {
          gte: dayStart,
          lte: dayEnd
        }
      },
      include: {
        slot: true
      }
    })

    // All active slots in the workspace today to check studio capacity
    const workspaceSlots = await prisma.slot.findMany({
      where: {
        workspaceId: artist.workspaceId,
        isActive: true,
        startTime: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    })

    // Business Hours slots: 09:00 to 19:00 hourly
    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
    const availableSlots: string[] = []

    for (const hr of hours) {
      const slotStart = new Date(`${dateStr}T${hr}:00-03:00`)
      const slotEnd = new Date(slotStart.getTime() + durationMin * 60 * 1000)

      // 1. Check if artist has a conflict
      const hasArtistConflict = artistBookings.some((booking) => {
        const bStart = new Date(booking.scheduledFor)
        const bEnd = new Date(bStart.getTime() + booking.duration * 60 * 1000)
        return slotStart < bEnd && slotEnd > bStart
      })

      if (hasArtistConflict) continue

      // 2. Check if workspace capacity is exceeded
      const activeSlotsInInterval = workspaceSlots.filter((slot) => {
        const sStart = new Date(slot.startTime)
        const sEnd = new Date(slot.endTime)
        return slotStart < sEnd && slotEnd > sStart
      })

      if (activeSlotsInInterval.length >= capacity) continue

      // If no conflict, slot is free
      availableSlots.push(hr)
    }

    return { success: true, slots: availableSlots }
  } catch (error) {
    console.error('Error calculating available slots:', error)
    return { success: false, error: 'Erro ao calcular horários livres' }
  }
}

/**
 * Creates a booking request from the public Kiosk form.
 */
export async function createKioskBooking(rawData: any) {
  // Anti-bot Protection: Honeypot field
  if (rawData.honeypot && rawData.honeypot.trim().length > 0) {
    console.warn('🤖 Bot detected in honeypot field. Silent rejection.')
    return { success: true, message: 'Agendamento recebido, aguardando confirmação' }
  }

  // Zod Validation
  const result = kioskBookingSchema.safeParse(rawData)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const data = result.data
  const phone = data.phone?.trim()
  const instagram = data.instagram?.trim()

  try {
    // 1. Look up artist and workspace details
    const artist = await prisma.artist.findUnique({
      where: { id: data.artistId },
      include: { workspace: true, user: true }
    })

    if (!artist || !artist.workspaceId) {
      return { success: false, error: 'Artista selecionado não possui estúdio associado.' }
    }

    // 2. Find or Create Client
    let client = null

    // Match criteria: Telefone or email derived from Instagram
    const instagramEmail = instagram ? `${instagram.replace('@', '').toLowerCase()}@instagram.com` : undefined

    if (phone) {
      client = await prisma.user.findFirst({
        where: { phone, role: 'CLIENT' }
      })
    }

    if (!client && instagramEmail) {
      client = await prisma.user.findFirst({
        where: { email: instagramEmail, role: 'CLIENT' }
      })
    }

    if (!client) {
      // Create a sovereign CLIENT user profile
      client = await prisma.user.create({
        data: {
          name: data.name,
          phone: phone || null,
          email: instagramEmail || null,
          role: 'CLIENT'
        }
      })
      console.log(`✅ [Kiosk] Novo cliente cadastrado: ${client.name}`)
    }

    // 3. Allocate a free table/maca in the workspace
    const scheduledStart = new Date(data.scheduledFor)
    const scheduledEnd = new Date(scheduledStart.getTime() + data.duration * 60 * 1000)

    const workspaceSlots = await prisma.slot.findMany({
      where: {
        workspaceId: artist.workspaceId,
        isActive: true,
        startTime: { lt: scheduledEnd },
        endTime: { gt: scheduledStart }
      }
    })

    const capacity = artist.workspace?.capacity || 3
    const occupiedMacas = new Set(workspaceSlots.map(s => s.macaId))
    
    let allocatedMacaId = null
    for (let m = 1; m <= capacity; m++) {
      if (!occupiedMacas.has(m)) {
        allocatedMacaId = m
        break
      }
    }

    if (!allocatedMacaId) {
      return { success: false, error: 'Não há macas disponíveis no horário escolhido. Por favor, selecione outro horário.' }
    }

    // Create the Slot
    const slot = await prisma.slot.create({
      data: {
        workspaceId: artist.workspaceId,
        macaId: allocatedMacaId,
        startTime: scheduledStart,
        endTime: scheduledEnd,
        isActive: true
      }
    })

    // Create the Booking
    // status: OPEN, value: 0 (artist defines rate later)
    const booking = await prisma.booking.create({
      data: {
        artistId: artist.id,
        clientId: client.id,
        workspaceId: artist.workspaceId,
        slotId: slot.id,
        value: 0,
        discountValue: 0,
        finalValue: 0,
        studioShare: 0,
        artistShare: 0,
        status: 'OPEN',
        type: data.type,
        scheduledFor: scheduledStart,
        duration: data.duration,
        notes: data.notes || '',
        syncedToGoogle: false
      }
    })

    console.log(`✅ [Kiosk] Agendamento criado com sucesso. ID: ${booking.id}`)

    // Create Kiosk Entry logging
    await prisma.kioskEntry.create({
      data: {
        workspaceId: artist.workspaceId,
        name: data.name,
        phone: phone || null,
        instagram: instagram || null,
        type: 'CLIENT',
        intent: data.type,
        artistId: artist.id,
        marketingOptIn: true
      }
    })

    revalidatePath('/artist/agenda')

    return { success: true, message: 'Agendamento recebido, aguardando confirmação' }
  } catch (error: any) {
    console.error('Error creating Kiosk booking:', error)
    return { success: false, error: error.message || 'Erro ao processar agendamento' }
  }
}
