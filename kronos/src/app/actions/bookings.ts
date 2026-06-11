'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, getGoogleCalendarClient } from "@/lib/google"
import { bookingSchema } from "@/lib/validations"
import { sendBookingConfirmation } from "@/lib/notifications"
import { calculateBookingSplit, calculateCommission } from "@/lib/business-rules"
import { addXP, unlockAchievement } from "@/lib/gamification"

/**
 * Create a new booking
 */
export async function createBooking(data: {
    clientId: string
    scheduledFor: Date
    duration: number
    type: string
    estimatedPrice: number
    notes?: string
    status?: 'OPEN' | 'CONFIRMED'
    syncToGoogle?: boolean
    macaId?: number
}) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { error: 'Não autorizado' }
        }

        // Validação Zod
        const validated = bookingSchema.safeParse(data)
        if (!validated.success) {
            return { error: `Dados inválidos: ${validated.error.issues[0].message}` }
        }

        // Get artist from session
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: {
                artist: true,
                memberships: true
            }
        })

        if (!user?.artist) {
            return { error: 'Apenas artistas podem criar agendamentos' }
        }

        const workspaceId = user.memberships[0]?.workspaceId

        if (!workspaceId) {
            return { error: 'Workspace não encontrado' }
        }

        // Fetch Workspace Settings (Capacity)
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { capacity: true, ownerId: true, name: true, googleCalendarId: true }
        })

        if (!workspace) return { error: 'Workspace inválido' }

        // Check for time conflicts across ALL Macas
        const TOTAL_MACAS = workspace.capacity || 5
        let availableMacaId = null

        // Format dates for query
        const start = data.scheduledFor
        const end = new Date(start.getTime() + data.duration * 60000)

        // Verificar conflitos de horário para o mesmo ARTISTA (evitar agendamento duplicado por profissional)
        const windowStart = new Date(start.getTime() - 12 * 60 * 60000)
        const windowEnd = new Date(start.getTime() + 12 * 60 * 60000)

        const artistBookings = await prisma.booking.findMany({
            where: {
                artistId: user.artist.id,
                status: { in: ['OPEN', 'CONFIRMED', 'COMPLETED'] },
                scheduledFor: {
                    gte: windowStart,
                    lte: windowEnd
                }
            },
            select: {
                id: true,
                scheduledFor: true,
                duration: true,
                client: {
                    select: { name: true }
                }
            }
        })

        for (const b of artistBookings) {
            const bStart = b.scheduledFor
            const bEnd = new Date(bStart.getTime() + b.duration * 60000)
            
            if (start < bEnd && end > bStart) {
                const startStr = bStart.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
                const endStr = bEnd.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
                return { 
                    error: `Você já possui um agendamento com ${b.client?.name || 'outro cliente'} neste horário (${startStr} até ${endStr}).`
                }
            }
        }

        // 0. Disponibilidade verificada APENAS contra slots internos do banco.
        // Eventos pessoais do Google Calendar do artista NÃO bloqueiam a agenda do estúdio.
        // A agenda compartilhada do estúdio recebe espelhos — não é consultada para disponibilidade.

        if (data.macaId !== undefined && data.macaId !== null) {
            // Se o artista escolheu uma maca manualmente
            if (data.macaId < 1 || data.macaId > TOTAL_MACAS) {
                return { error: `Maca inválida. O estúdio possui capacidade para até ${TOTAL_MACAS} macas.` }
            }

            const conflict = await prisma.slot.findFirst({
                where: {
                    workspaceId,
                    macaId: data.macaId,
                    isActive: true,
                    OR: [
                        {
                            startTime: { lt: end },
                            endTime: { gt: start }
                        }
                    ]
                }
            })

            if (conflict) {
                return { error: `A Maca ${data.macaId} já está ocupada neste horário.` }
            }

            availableMacaId = data.macaId
        } else {
            // Auto-seleção clássica
            for (let i = 1; i <= TOTAL_MACAS; i++) {
                const conflict = await prisma.slot.findFirst({
                    where: {
                        workspaceId,
                        macaId: i,
                        isActive: true,
                        OR: [
                            {
                                startTime: { lt: end },
                                endTime: { gt: start }
                            }
                        ]
                    }
                })

                if (!conflict) {
                    availableMacaId = i
                    break
                }
            }
        }

        if (!availableMacaId) {
            return { error: 'Sem disponibilidade: Todas as macas estão ocupadas neste horário.' }
        }

        // Create Slot linked to the found Maca
        const slot = await prisma.slot.create({
            data: {
                workspaceId,
                macaId: availableMacaId,
                startTime: start,
                endTime: end,
                isActive: true
            }
        })

        const commissionRate = calculateCommission(user.artist.plan, user.artist.monthlyEarnings || 0)
        const { finalValue, artistShare, studioShare } = calculateBookingSplit(
            data.estimatedPrice,
            0,
            commissionRate
        )

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                artistId: user.artist.id,
                clientId: data.clientId,
                workspaceId,
                slotId: slot.id,
                value: data.estimatedPrice,
                discountValue: 0,
                finalValue,
                studioShare,
                artistShare,
                status: data.status || 'OPEN',
                type: data.type,
                scheduledFor: data.scheduledFor,
                duration: data.duration,
                notes: data.notes as any,
                syncedToGoogle: false
            } as any,
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        })

        // 3. Sync to Google Calendar — Duplo espelho: agenda do estúdio + agenda pessoal do artista
        // Regras:
        //   • O artista deve ter calendarSyncEnabled = true
        //   • O workspace deve ter um googleCalendarId configurado para o espelho do estúdio
        //   • Eventos pessoais do Google do artista NÃO interferem na disponibilidade de macas
        //   • As macas são gerenciadas internamente no banco — não aparecem no Google Calendar
        const artistSyncEnabled = user.artist?.calendarSyncEnabled === true
        const studioCalendarId = workspace.googleCalendarId

        if (artistSyncEnabled) {
            const eventStart = data.scheduledFor
            const eventEnd = new Date(data.scheduledFor.getTime() + data.duration * 60000)
            const eventSummary = `🎨 ${(booking as any).client.name} — ${data.type}`
            const eventDescription = [
                `🎫 KRONØS OS`,
                ``,
                `👨‍🎨 Artista: ${user.name}`,
                `👤 Cliente: ${(booking as any).client.name}`,
                `📝 Tipo: ${data.type}`,
                `💬 Obs: ${data.notes || 'Nenhuma'}`,
                ``,
                `*Gerado automaticamente pelo KRONØS.*`
            ].join('\n')

            try {
                // 3a. Espelho na agenda COMPARTILHADA do estúdio (se configurada)
                if (studioCalendarId) {
                    const studioResult = await createCalendarEvent(workspace.ownerId, {
                        summary: eventSummary,
                        description: eventDescription,
                        startTime: eventStart,
                        endTime: eventEnd,
                        calendarId: studioCalendarId
                    })

                    if (studioResult.success && studioResult.eventId) {
                        await prisma.booking.update({
                            where: { id: booking.id },
                            data: {
                                googleEventId: studioResult.eventId,
                                syncedToGoogle: true
                            }
                        })
                        console.log(`✅ Espelho criado na agenda do estúdio: ${studioCalendarId}`)
                    }
                }

                // 3b. Espelho na agenda PESSOAL do artista (calendar 'primary')
                const personalResult = await createCalendarEvent(user.id, {
                    summary: eventSummary,
                    description: eventDescription,
                    startTime: eventStart,
                    endTime: eventEnd
                    // calendarId omitido → usa 'primary' (agenda pessoal padrão)
                })

                if (personalResult.success) {
                    console.log(`✅ Espelho criado na agenda pessoal do artista: ${user.name}`)
                    // Se não tiver ainda salvo o googleEventId (ex: studio não configurado), salva o pessoal
                    if (!studioCalendarId && personalResult.eventId) {
                        await prisma.booking.update({
                            where: { id: booking.id },
                            data: {
                                googleEventId: personalResult.eventId,
                                syncedToGoogle: true
                            }
                        })
                    }
                }

            } catch (syncError) {
                console.warn('⚠️ Falha no sync Google Calendar (falha silenciosa — booking salvo):', syncError)
            }
        }

        revalidatePath('/artist/agenda')

        // 5. Notificar Cliente (Background) via E-mail Clássico
        if (booking.client.email) {
            sendBookingConfirmation({
                clientName: booking.client.name || 'Cliente',
                clientEmail: booking.client.email,
                artistName: user.name || 'Artista',
                studioName: workspace.name,
                scheduledFor: data.scheduledFor,
                duration: data.duration,
                value: data.estimatedPrice,
                bookingId: booking.id
            }).catch(e => console.error('⚠️ Erro ao enviar notificação:', e))
        }

        // 5.1 Notificar Cliente (Background) via WhatsApp Direto
        const clientPhone = booking.client.phone
        if (clientPhone) {
            const rawDate = new Date(data.scheduledFor)
            const dateStr = rawDate.toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            
            const messageText = `⚡ *KRONØS OS - Agendamento Confirmado* ⚡\n\nOlá, *${booking.client.name || 'Cliente'}*!\nSeu agendamento no *${workspace.name}* foi confirmado com sucesso.\n\n👤 *Artista:* ${user.name || 'Artista'}\n📅 *Data:* ${dateStr}\n💰 *Valor Estimado:* R$ ${data.estimatedPrice.toFixed(2)}\n\n⚠️ *IMPORTANTE:* O preenchimento da sua Ficha de Anamnese é obrigatório antes do início da sessão.\nAcesse o link seguro para respondê-la digitalmente:\n👉 ${process.env.NEXTAUTH_URL}/fichas/${booking.id}\n\nNos vemos em breve!\n_${workspace.name}_`

            import('@/lib/whatsapp').then(({ sendWhatsAppMessage }) => {
                sendWhatsAppMessage({
                    phone: clientPhone,
                    text: messageText
                })
            }).catch(e => console.error('⚠️ Erro ao carregar whatsapp helper:', e))
        }

        // 6. Disparo de Automação n8n (WhatsApp / Fluxos Avançados)
        import('@/lib/webhook').then(({ dispatchWebhook }) => {
            dispatchWebhook({
                event: 'BOOKING_CREATED',
                data: {
                    bookingId: booking.id,
                    clientPhone: booking.client.phone,
                    clientName: booking.client.name,
                    artistName: user.name,
                    scheduledFor: data.scheduledFor,
                    duration: data.duration,
                    value: data.estimatedPrice,
                    type: data.type,
                    notes: data.notes
                }
            })
        }).catch(e => console.error('Failed to import webhook dispatcher', e))

        return { success: true, booking }

    } catch (error) {
        console.error('Error creating booking:', error)
        return { error: 'Erro ao criar agendamento' }
    }
}

/**
 * Get artist's bookings for a date range
 */
export async function getMyBookings(data: {
    startDate: Date
    endDate: Date
    includeGoogleEvents?: boolean
}) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { artist: true, memberships: true }
        })

        if (!user?.artist) {
            return { error: 'Apenas artistas podem ver agendamentos' }
        }
        
        const workspaceId = user.memberships?.[0]?.workspaceId || user.artist?.workspaceId;

        const whereClause: any = {
            scheduledFor: {
                gte: data.startDate,
                lte: data.endDate
            },
            status: { not: 'CANCELLED' } // Ocultar os cancelados da view
        };

        if (workspaceId) {
            whereClause.workspaceId = workspaceId; // Traz de todos do estúdio
        } else {
            whereClause.artistId = user.artist.id; // Fallback: só o dele
        }

        const rawBookings = await prisma.booking.findMany({
            where: whereClause,
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        image: true
                    }
                },
                artist: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: {
                scheduledFor: 'asc'
            }
        })
        
        // Identifica quais bookings pertencem a companheiros de estúdio 
        const bookings = rawBookings.map(b => ({
            ...b,
            isStudioMate: b.artistId !== user.artist?.id
        }));

        // 3. Merge with Google Calendar events if requested
        let unifiedEvents: any[] = [...bookings]

        if (data.includeGoogleEvents) {
            try {
                const calendar = await getGoogleCalendarClient(user.id)
                if (calendar) {
                    const googleResponse = await calendar.events.list({
                        calendarId: 'primary',
                        timeMin: data.startDate.toISOString(),
                        timeMax: data.endDate.toISOString(),
                        singleEvents: true,
                        orderBy: 'startTime',
                    })

                    const googleEvents = googleResponse.data.items || []

                    // Filter out events that are already in KRONØS (matches by googleEventId)
                    const kronosGoogleIds = new Set(bookings.map(b => b.googleEventId).filter(Boolean))

                    const externalEvents = googleEvents
                        .filter((ge: any) => !kronosGoogleIds.has(ge.id))
                        .map((ge: any) => ({
                            id: `google-${ge.id}`,
                            isExternal: true,
                            title: ge.summary || '(Sem Título)',
                            scheduledFor: new Date(ge.start?.dateTime || ge.start?.date || ''),
                            duration: ge.end?.dateTime
                                ? Math.floor((new Date(ge.end.dateTime).getTime() - new Date(ge.start?.dateTime || '').getTime()) / 60000)
                                : 60,
                            status: 'EXTERNAL'
                        }))

                    unifiedEvents = [...unifiedEvents, ...externalEvents]
                }
            } catch (syncError) {
                console.warn('⚠️ Erro ao buscar eventos do Google para o calendário:', syncError)
            }
        }

        return { success: true, bookings: unifiedEvents }

    } catch (error) {
        console.error('Error fetching bookings:', error)
        return { error: 'Erro ao buscar agendamentos' }
    }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(data: {
    bookingId: string
    status: 'OPEN' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
}) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { artist: true }
        })

        if (!user?.artist) {
            return { error: 'Não autorizado' }
        }

        // Verify ownership
        const booking = await prisma.booking.findUnique({
            where: { id: data.bookingId }
        })

        if (!booking) {
            return { error: 'Agendamento não encontrado' }
        }

        if (booking.artistId !== user.artist.id && user.role !== 'ADMIN') {
            return { error: 'Você não tem permissão para alterar este agendamento' }
        }

        // Update status
        const updatedBooking = await prisma.booking.update({
            where: { id: data.bookingId },
            data: { status: data.status },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        })

        // 3. Atualizar evento no Google Calendar (agenda pessoal + agenda compartilhada)
        if (updatedBooking.syncedToGoogle && updatedBooking.googleEventId) {
            try {
                // Busca o workspace para saber se tem agenda compartilhada
                const workspace = booking.workspaceId ? await prisma.workspace.findUnique({
                    where: { id: booking.workspaceId as string },
                    select: { ownerId: true, googleCalendarId: true }
                }) : null;

                const statusLabel = {
                    COMPLETED: 'Concluído ✅',
                    CANCELLED: 'Cancelado ❌',
                    CONFIRMED: 'Confirmado 🟢',
                    OPEN: 'Aberto'
                }[data.status] || data.status

                // Atualiza na agenda PESSOAL do artista
                await updateCalendarEvent(user.id, updatedBooking.googleEventId, {
                    summary: `🎨 ${updatedBooking.client.name} — ${(updatedBooking as any).type || ''} (${statusLabel})`,
                    description: [
                        `🎫 KRONØS OS`,
                        ``,
                        `👨‍🎨 Artista: ${user.name}`,
                        `👤 Cliente: ${updatedBooking.client.name}`,
                        `📝 Tipo: ${(updatedBooking as any).type || ''}`,
                        `💬 Obs: ${(updatedBooking as any).notes || 'Nenhuma'}`,
                        `ℹ️ Status: ${statusLabel}`,
                        ``,
                        `*Atualizado automaticamente pelo KRONØS.*`
                    ].join('\n')
                })

                // Atualiza/Remove na AGENDA COMPARTILHADA do estúdio
                if (workspace?.googleCalendarId && data.status === 'CANCELLED') {
                    // Tenta deletar da agenda compartilhada ao cancelar
                    await deleteCalendarEvent(
                        workspace.ownerId,
                        updatedBooking.googleEventId,
                        workspace.googleCalendarId
                    ).catch(e => console.warn('⚠️ Não foi possível remover da agenda compartilhada:', e))
                } else if (workspace?.googleCalendarId) {
                    // Atualiza o status na agenda compartilhada
                    await updateCalendarEvent(
                        workspace.ownerId,
                        updatedBooking.googleEventId,
                        {
                            summary: `🎨 ${updatedBooking.client.name} — ${(updatedBooking as any).type || ''} (${statusLabel})`,
                            description: [
                                `🎫 KRONØS OS`,
                                ``,
                                `👨‍🎨 Artista: ${user.name}`,
                                `👤 Cliente: ${updatedBooking.client.name}`,
                                `📝 Tipo: ${(updatedBooking as any).type || ''}`,
                                `ℹ️ Status: ${statusLabel}`,
                                ``,
                                `*Atualizado automaticamente pelo KRONØS.*`
                            ].join('\n')
                        },
                        workspace.googleCalendarId
                    ).catch(e => console.warn('⚠️ Não foi possível atualizar agenda compartilhada:', e))
                }

            } catch (syncError) {
                console.warn('⚠️ Falha ao atualizar evento no Google:', syncError)
            }
        }

        // 4. Disparo de Automação n8n (WhatsApp / Fluxos Avançados)
        if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
            import('@/lib/webhook').then(({ dispatchWebhook }) => {
                dispatchWebhook({
                    event: data.status === 'COMPLETED' ? 'BOOKING_COMPLETED' : 'BOOKING_CANCELLED',
                    data: {
                        bookingId: updatedBooking.id,
                        clientPhone: updatedBooking.client.phone,
                        clientName: updatedBooking.client.name,
                        artistName: user.name,
                        status: data.status
                    }
                })
            }).catch(e => console.error('Failed to import webhook dispatcher', e))
        }

        // 5. Gamification: Adicionar XP quando booking for completado
        if (data.status === 'COMPLETED') {
            try {
                // Calcular XP baseado no valor do booking (1 XP por R$ 10)
                const xpEarned = Math.floor((updatedBooking.finalValue || 0) / 10)
                
                if (xpEarned > 0) {
                    await addXP(user.artist.id, xpEarned, 'TATTOO_SESSION')
                    console.log(`🎮 Gamification: +${xpEarned} XP adicionados para artista ${user.artist.id}`)
                }

                // Verificar se é o primeiro booking completado (achievement FIRST_INK)
                const completedBookingsCount = await prisma.booking.count({
                    where: {
                        artistId: user.artist.id,
                        status: 'COMPLETED'
                    }
                })

                if (completedBookingsCount === 1) {
                    await unlockAchievement(user.artist.id, 'FIRST_INK')
                    console.log(`🏆 Achievement desbloqueado: FIRST_INK para artista ${user.artist.id}`)
                }

                // Verificar achievement HIGH_ROLLER (booking acima de R$ 2000)
                if ((updatedBooking.finalValue || 0) >= 2000) {
                    await unlockAchievement(user.artist.id, 'HIGH_ROLLER')
                    console.log(`🏆 Achievement desbloqueado: HIGH_ROLLER para artista ${user.artist.id}`)
                }
            } catch (gamificationError) {
                console.error('Erro ao processar gamificação:', gamificationError)
                // Não falhar o booking se gamificação falhar
            }
        }

        revalidatePath('/artist/agenda')
        return { success: true, booking: updatedBooking }

    } catch (error) {
        console.error('Error updating booking status:', error)
        return { error: 'Erro ao atualizar status' }
    }
}

/**
 * Update booking details (horário, duração, valor, notas)
 */
export async function updateBooking(data: {
    bookingId: string
    scheduledFor?: Date
    duration?: number
    value?: number
    notes?: string
}) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { artist: true }
        })

        if (!user?.artist) {
            return { error: 'Não autorizado' }
        }

        // Verify ownership
        const booking = await prisma.booking.findUnique({
            where: { id: data.bookingId },
            include: { slot: true }
        })

        if (!booking) {
            return { error: 'Agendamento não encontrado' }
        }

        if (booking.artistId !== user.artist.id && user.role !== 'ADMIN') {
            return { error: 'Você não tem permissão para editar este agendamento' }
        }

        // Não permitir edição de bookings já concluídos ou cancelados
        if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
            return { error: 'Não é possível editar agendamentos concluídos ou cancelados' }
        }

        // Calcular novos valores se necessário
        let updateData: any = {}
        
        if (data.scheduledFor) {
            updateData.scheduledFor = data.scheduledFor
        }
        
        if (data.duration) {
            updateData.duration = data.duration
        }
        
        if (data.value !== undefined) {
            updateData.value = data.value
        }
        
        if (data.notes !== undefined) {
            updateData.notes = data.notes
        }

        // Se horário ou duração mudou, atualizar o slot também
        if (data.scheduledFor || data.duration) {
            const newStart = data.scheduledFor || booking.scheduledFor
            const newDuration = data.duration || booking.duration
            const newEnd = new Date(newStart.getTime() + newDuration * 60000)

            // Atualizar slot
            await prisma.slot.update({
                where: { id: booking.slotId },
                data: {
                    startTime: newStart,
                    endTime: newEnd
                }
            })

            // Atualizar evento no Google Calendar se estiver sincronizado
            if (booking.syncedToGoogle && booking.googleEventId) {
                try {
                    await updateCalendarEvent(user.id, booking.googleEventId, {
                        startTime: newStart,
                        endTime: newEnd
                    })
                } catch (syncError) {
                    console.warn('⚠️ Falha ao atualizar evento no Google:', syncError)
                }
            }
        }

        // Recalcular split se valor mudou
        if (data.value !== undefined) {
            const commissionRate = calculateCommission(user.artist.plan, user.artist.monthlyEarnings || 0)
            const { finalValue, artistShare, studioShare } = calculateBookingSplit(
                data.value,
                booking.discountValue || 0,
                commissionRate
            )
            updateData.finalValue = finalValue
            updateData.artistShare = artistShare
            updateData.studioShare = studioShare
        }

        // Atualizar booking
        const updatedBooking = await prisma.booking.update({
            where: { id: data.bookingId },
            data: updateData
        })

        revalidatePath('/artist/agenda')
        return { success: true, booking: updatedBooking }

    } catch (error) {
        console.error('Error updating booking:', error)
        return { error: 'Erro ao atualizar agendamento' }
    }
}

/**
 * Delete booking
 */
export async function deleteBooking(bookingId: string) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { artist: true }
        })

        if (!user?.artist) {
            return { error: 'Não autorizado' }
        }

        // Verify ownership
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        })

        if (!booking) {
            return { error: 'Agendamento não encontrado' }
        }

        if (booking.artistId !== user.artist.id && user.role !== 'ADMIN') {
            return { error: 'Você não tem permissão para deletar este agendamento' }
        }

        // Delete booking
        await prisma.booking.delete({
            where: { id: bookingId }
        })

        // 3. Remover do Google Calendar (agenda pessoal + agenda compartilhada)
        if (booking.syncedToGoogle && booking.googleEventId) {
            try {
                // Busca o workspace para saber se tem agenda compartilhada
                const workspace = booking.workspaceId ? await prisma.workspace.findUnique({
                    where: { id: booking.workspaceId },
                    select: { ownerId: true, googleCalendarId: true }
                }) : null;

                // Remove da agenda PESSOAL do artista
                await deleteCalendarEvent(user.id, booking.googleEventId)

                // Remove da AGENDA COMPARTILHADA do estúdio
                if (workspace?.googleCalendarId) {
                    await deleteCalendarEvent(
                        workspace.ownerId,
                        booking.googleEventId,
                        workspace.googleCalendarId
                    ).catch(e => console.warn('⚠️ Não foi possível remover da agenda compartilhada:', e))
                }

            } catch (syncError) {
                console.warn('⚠️ Falha ao remover evento do Google:', syncError)
            }
        }

        // 4. Disparo de Automação n8n
        import('@/lib/webhook').then(({ dispatchWebhook }) => {
            dispatchWebhook({
                event: 'BOOKING_CANCELLED',
                data: {
                    bookingId: booking.id,
                    artistName: user.name,
                    status: 'DELETED'
                }
            })
        }).catch(e => console.error('Failed to import webhook dispatcher', e))

        revalidatePath('/artist/agenda')
        return { success: true }

    } catch (error) {
        console.error('Error deleting booking:', error)
        return { error: 'Erro ao deletar agendamento' }
    }
}

/**
 * Get ALL bookings for the current workspace (Studio Master View)
 */
export async function getWorkspaceBookings(data: {
    startDate: Date
    endDate: Date
}) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) return { error: 'Não autorizado' }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { memberships: true }
        })

        const workspaceId = user?.memberships[0]?.workspaceId
        if (!workspaceId) return { error: 'Workspace não selecionado' }

        // Fetch all bookings for this, regardless of artist
        const bookings = await prisma.booking.findMany({
            where: {
                workspaceId,
                scheduledFor: {
                    gte: data.startDate,
                    lte: data.endDate
                },
                status: { not: 'CANCELLED' }
            },
            include: {
                client: {
                    select: { name: true } // Minimal info for transparency
                },
                artist: {
                    include: { user: { select: { name: true, image: true, customColor: true } } }
                },
                slot: true // Crucial for Maca ID
            },
            orderBy: {
                scheduledFor: 'asc'
            }
        })

        return { success: true, bookings }

    } catch (error) {
        console.error('Error fetching workspace bookings:', error)
        return { error: 'Erro ao buscar agenda do estúdio' }
    }
}

/**
 * Get ALL bookings for the studio agenda view:
 * - All internal bookings from the workspace
 * - Google Calendar events from the studio shared calendar (galeria.kronos@gmail.com)
 */
export async function getStudioAgendaBookings(data: {
    startDate: Date
    endDate: Date
}) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) return { error: 'Não autorizado' }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { memberships: true, artist: true }
        })

        const workspaceId = user?.memberships[0]?.workspaceId
        if (!workspaceId) return { error: 'Workspace não selecionado' }

        // Fetch all internal bookings for this workspace
        const rawBookings = await prisma.booking.findMany({
            where: {
                workspaceId,
                scheduledFor: {
                    gte: data.startDate,
                    lte: data.endDate
                },
                status: { not: 'CANCELLED' }
            },
            include: {
                client: {
                    select: { name: true, id: true }
                },
                artist: {
                    include: { user: { select: { name: true, image: true, customColor: true } } }
                },
                slot: true
            },
            orderBy: { scheduledFor: 'asc' }
        })

        // Mark each booking with the current user's artist id to distinguish isStudioMate
        const bookings = rawBookings.map(b => ({
            ...b,
            isStudioMate: b.artistId !== user?.artist?.id,
            isExternal: false
        }))

        // Fetch Google Calendar events from the studio's shared calendar
        let allEvents: any[] = [...bookings]

        try {
            // Get workspace to find the studio Google Calendar ID and owner
            const workspace = await prisma.workspace.findUnique({
                where: { id: workspaceId },
                select: { googleCalendarId: true, ownerId: true }
            })

            if (workspace?.googleCalendarId && workspace?.ownerId) {
                const calendar = await getGoogleCalendarClient(workspace.ownerId)

                if (calendar) {
                    const googleResponse = await calendar.events.list({
                        calendarId: workspace.googleCalendarId,
                        timeMin: data.startDate.toISOString(),
                        timeMax: data.endDate.toISOString(),
                        singleEvents: true,
                        orderBy: 'startTime',
                    })

                    const googleEvents = googleResponse.data.items || []

                    // Deduplicate: filter out events already synced as internal bookings
                    const kronosGoogleIds = new Set(rawBookings.map(b => b.googleEventId).filter(Boolean))

                    const studioExternalEvents = googleEvents
                        .filter((ge: any) => !kronosGoogleIds.has(ge.id))
                        .map((ge: any) => ({
                            id: `google-studio-${ge.id}`,
                            isExternal: true,
                            isStudioMate: false,
                            title: ge.summary || '(Evento Externo)',
                            scheduledFor: new Date(ge.start?.dateTime || ge.start?.date || ''),
                            duration: ge.end?.dateTime
                                ? Math.floor((new Date(ge.end.dateTime).getTime() - new Date(ge.start?.dateTime || '').getTime()) / 60000)
                                : 60,
                            status: 'EXTERNAL'
                        }))

                    allEvents = [...allEvents, ...studioExternalEvents]
                }
            }
        } catch (syncError) {
            console.warn('⚠️ Erro ao buscar eventos da agenda do estúdio:', syncError)
        }

        return { success: true, bookings: allEvents }

    } catch (error) {
        console.error('Error fetching studio agenda bookings:', error)
        return { error: 'Erro ao buscar agenda do estúdio' }
    }
}

/**
 * Revert a completed booking back to CONFIRMED
 * Only allowed within a 24-hour window, and if it's not part of any settlement.
 */
export async function revertBookingCompletion(bookingId: string) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { artist: true }
        })

        if (!user?.artist) {
            return { error: 'Não autorizado' }
        }

        // Verify ownership
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        })

        if (!booking) {
            return { error: 'Agendamento não encontrado' }
        }

        if (booking.artistId !== user.artist.id && user.role !== 'ADMIN') {
            return { error: 'Você não tem permissão para alterar este agendamento' }
        }

        if (booking.status !== 'COMPLETED') {
            return { error: 'Apenas agendamentos concluídos podem ser revertidos' }
        }

        if (booking.settlementId) {
            return { error: 'Este agendamento já está vinculado a um acerto financeiro e não pode ser revertido' }
        }

        // Check 24 hour window
        const timeSinceUpdate = new Date().getTime() - new Date(booking.updatedAt).getTime()
        const twentyFourHours = 24 * 60 * 60 * 1000
        if (timeSinceUpdate > twentyFourHours) {
            return { error: 'O prazo de 24 horas para reverter a conclusão expirou' }
        }

        // Revert status to CONFIRMED
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'CONFIRMED' },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        })

        // Atualizar evento no Google Calendar se necessário
        if (updatedBooking.syncedToGoogle && updatedBooking.googleEventId) {
            try {
                const workspace = booking.workspaceId ? await prisma.workspace.findUnique({
                    where: { id: booking.workspaceId as string },
                    select: { ownerId: true, googleCalendarId: true }
                }) : null

                const statusLabel = 'Confirmado 🟢'

                await updateCalendarEvent(user.id, updatedBooking.googleEventId, {
                    summary: `🎨 ${updatedBooking.client.name} — ${(updatedBooking as any).type || ''} (${statusLabel})`,
                    description: [
                        `🎫 KRONØS OS`,
                        ``,
                        `👨‍🎨 Artista: ${user.name}`,
                        `👤 Cliente: ${updatedBooking.client.name}`,
                        `📝 Tipo: ${(updatedBooking as any).type || ''}`,
                        `💬 Obs: ${(updatedBooking as any).notes || 'Nenhuma'}`,
                        `ℹ️ Status: ${statusLabel}`,
                        ``,
                        `*Atualizado automaticamente pelo KRONØS.*`
                    ].join('\n')
                })

                if (workspace?.googleCalendarId) {
                    await updateCalendarEvent(
                        workspace.ownerId,
                        updatedBooking.googleEventId,
                        {
                            summary: `🎨 ${updatedBooking.client.name} — ${(updatedBooking as any).type || ''} (${statusLabel})`,
                            description: [
                                `🎫 KRONØS OS`,
                                ``,
                                `👨‍🎨 Artista: ${user.name}`,
                                `👤 Cliente: ${updatedBooking.client.name}`,
                                `📝 Tipo: ${(updatedBooking as any).type || ''}`,
                                `ℹ️ Status: ${statusLabel}`,
                                ``,
                                `*Atualizado automaticamente pelo KRONØS.*`
                            ].join('\n')
                        },
                        workspace.googleCalendarId
                    ).catch(e => console.warn('⚠️ Não foi possível atualizar agenda compartilhada:', e))
                }
            } catch (syncError) {
                console.warn('⚠️ Falha ao atualizar evento no Google:', syncError)
            }
        }

        revalidatePath('/artist/agenda')
        return { success: true, booking: updatedBooking }

    } catch (error) {
        console.error('Error reverting booking completion:', error)
        return { error: 'Erro ao reverter conclusão do agendamento' }
    }
}


