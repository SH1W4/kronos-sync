import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    // 1. Proteger a rota usando CRON_SECRET
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    try {
        const now = new Date()

        // 2. Query: Buscar artistas convidados cuja data de expiração passou e que estão ativos
        const expiredGuests = await prisma.artist.findMany({
            where: {
                plan: 'GUEST',
                isActive: true,
                validUntil: {
                    lt: now
                }
            },
            include: {
                user: true,
                workspace: true
            }
        })

        if (expiredGuests.length === 0) {
            return NextResponse.json({ message: 'Nenhum convidado expirado encontrado.', expired: 0 })
        }

        console.log(`[cron-check-expired-guests] Encontrados ${expiredGuests.length} artistas convidados expirados.`)

        let processedCount = 0

        // 3. Processar cada artista expirado
        for (const artist of expiredGuests) {
            try {
                // Transação para consistência no banco
                await prisma.$transaction([
                    prisma.workspaceMember.deleteMany({
                        where: {
                            userId: artist.userId,
                            workspaceId: artist.workspaceId || ''
                        }
                    }),
                    prisma.artist.update({
                        where: { id: artist.id },
                        data: {
                            isActive: false,
                            workspaceId: null
                        }
                    })
                ])

                // Revogar compartilhamento do Google Calendar
                if (artist.workspace?.googleCalendarId && artist.user.email) {
                    try {
                        const { removeCalendarShare } = await import('@/lib/google-admin')
                        await removeCalendarShare(artist.workspace.googleCalendarId, artist.user.email)
                    } catch (calErr) {
                        console.error(`[cron-check-expired-guests] Falha ao revogar calendário para ${artist.user.email}:`, calErr)
                    }
                }

                // Disparar e-mail de encerramento
                if (artist.user.email) {
                    try {
                        const { sendGuestExpirationEmail } = await import('@/lib/email')
                        await sendGuestExpirationEmail(artist.user.email, artist.user.name || 'Artista')
                    } catch (emailErr) {
                        console.error(`[cron-check-expired-guests] Falha ao enviar e-mail de expiração para ${artist.user.email}:`, emailErr)
                    }
                }

                processedCount++
            } catch (err) {
                console.error(`[cron-check-expired-guests] Falha ao processar a expiração do artista ${artist.id}:`, err)
            }
        }

        return NextResponse.json({
            success: true,
            expired: processedCount
        })

    } catch (error: any) {
        console.error('[cron-check-expired-guests] Erro geral no cron:', error)
        return NextResponse.json({ error: 'Erro interno no cron job' }, { status: 500 })
    }
}
