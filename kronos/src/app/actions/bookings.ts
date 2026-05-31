'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, getGoogleCalendarClient } from "@/lib/google"
import { bookingSchema } from "@/lib/validations"
import { sendBookingConfirmation } from "@/lib/notifications"

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
            include: { artist: true, memberships: true }
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

        // 0. Pre-flight Check: Google Calendar Availability (Hybrid: Unit + Tower)
        try {
            const { checkGoogleAvailability } = await import('@/app/actions/calendar')

            // Check Unit (Artist) - REMOVED for Studio-First Strategy
            // Personal events should NOT block studio bookings.


            // Check Tower (Studio Owner) - if different person
            if (user.id !== workspace.ownerId) {
                // Se houver calendario do workspace configurado, usa ele. Senao usa o 'primary' do dono.
                const calendarToCheck = workspace.googleCalendarId || 'primary'

                const isStudioAvailable = await checkGoogleAvailability(workspace.ownerId, start, end, calendarToCheck)
                if (!isStudioAvailable) {
                    return { error: 'Agenda do Estúdio está bloqueada neste horário.' }
                }
            }

        } catch (err) {
            console.warn('⚠️ Google Availability Check Failed (Fail Open)', err)
        }
        // Duplicate check removed.

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

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                artistId: user.artist.id,
                clientId: data.clientId,
                workspaceId,
                slotId: slot.id,
                value: data.estimatedPrice,
                finalValue: data.estimatedPrice,
                studioShare: data.estimatedPrice * user.artist.commissionRate,
                artistShare: data.estimatedPrice * (1 - user.artist.commissionRate),
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

        // 3. Sync to Google Calendar
        // Auto-sync se o workspace tem agenda compartilhada configurada OU se o artista pediu sync
        const shouldSync = data.syncToGoogle || !!workspace.googleCalendarId
        if (shouldSync) {
            try {
                // 3a. Sync na agenda PESSOAL do artista
                const googleResult = await createCalendarEvent(user.id, {
                    summary: `Tatuagem: ${(booking as any).client.name}`,
                    description: `Sessão agendada via KRONØS\n\nTipo: ${data.type}\nObs: ${data.notes || ''}`,
                    startTime: data.scheduledFor,
                    endTime: new Date(data.scheduledFor.getTime() + data.duration * 60000)
                })

                if (googleResult.success && googleResult.eventId) {
                    await prisma.booking.update({
                        where: { id: booking.id },
                        data: {
                            googleEventId: googleResult.eventId,
                            syncedToGoogle: true
                        }
                    })
                }

                // 3b. Espelho na AGENDA COMPARTILHADA DO ESTUDIO (galeria.kronos@gmail.com)
                // Sempre usa googleCalendarId do workspace configurado
                if (workspace.googleCalendarId) {
                    await createCalendarEvent(workspace.ownerId, {
                        summary: `[MACA ${data.macaId}] ${user.name} - ${(booking as any).client.name}`,
                        description: `🎫 KRONØS OS\n\n🛏️ Maca Reservada: ${data.macaId}\n👨‍🎨 Artista: ${user.name}\n👤 Cliente: ${(booking as any).client.name}\n📝 Tipo: ${data.type}\n\n*Agendamento gerado automaticamente.*`,
                        startTime: data.scheduledFor,
                        endTime: new Date(data.scheduledFor.getTime() + data.duration * 60000),
                        calendarId: workspace.googleCalendarId
                    })
                    console.log(`✅ Espelho criado na agenda compartilhada: ${workspace.googleCalendarId}`)
                }

            } catch (syncError) {
                console.warn('⚠️ Falha no sync inicial com Google:', syncError)
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
                    summary: `Tatuagem: ${updatedBooking.client.name} (${statusLabel})`,
                    description: `Status: ${statusLabel}\nObs: ${(updatedBooking as any).notes || ''}`
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
                        { summary: `[KRONØS] ${user.name} → ${updatedBooking.client.name} (${statusLabel})` },
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

        revalidatePath('/artist/agenda')
        return { success: true, booking: updatedBooking }

    } catch (error) {
        console.error('Error updating booking status:', error)
        return { error: 'Erro ao atualizar status' }
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
