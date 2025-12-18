import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        // Check if user is logged in
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await req.json()
        const { code } = body

        if (!code) {
            return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
        }

        const cleanCode = code.trim()

        // 1. MASTER KEY CHECK (Environment Variable)
        // Allows immediate promotion to Artist/Resident for team members
        if (process.env.KRONOS_TEAM_KEY && cleanCode === process.env.KRONOS_TEAM_KEY) {
            const user = await prisma.user.findUnique({ where: { email: session.user.email } })

            if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

            // Update User Role
            await prisma.user.update({
                where: { id: user.id },
                data: { role: 'ARTIST' }
            })

            // Create/Update Artist Profile
            await prisma.artist.upsert({
                where: { userId: user.id },
                create: {
                    userId: user.id,
                    plan: 'RESIDENT',
                    commissionRate: 0.30 // Default resident rate
                },
                update: {
                    plan: 'RESIDENT'
                }
            })

            return NextResponse.json({ success: true, role: 'ARTIST', message: 'Bem-vindo à equipe Kronos' })
        }

        // 2. DATABASE INVITE CODE CHECK
        const invite = await prisma.inviteCode.findUnique({
            where: { code: cleanCode },
            include: { creator: true }
        })

        // Validations
        if (!invite) {
            return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
        }

        if (!invite.isActive) {
            return NextResponse.json({ error: 'Código inativo' }, { status: 400 })
        }

        if (invite.maxUses > 0 && invite.currentUses >= invite.maxUses) {
            return NextResponse.json({ error: 'Este código atingiu o limite de usos' }, { status: 400 })
        }

        if (invite.expiresAt && new Date() > invite.expiresAt) {
            return NextResponse.json({ error: 'Código expirado' }, { status: 400 })
        }

        // Execute Transaction
        await prisma.$transaction(async (tx) => {
            // 1. Update User
            const updatedUser = await tx.user.update({
                where: { email: session.user.email! },
                data: {
                    role: invite.role,
                    invitedById: invite.creatorId
                }
            })

            // 2. Increment Invite Usage
            await tx.inviteCode.update({
                where: { id: invite.id },
                data: { currentUses: { increment: 1 } }
            })

            // 3. Create Artist Profile if applicable
            if (invite.role === 'ARTIST' || invite.role === 'ADMIN') {
                const existingArtist = await tx.artist.findUnique({ where: { userId: updatedUser.id } })

                // Calcular data de validade se for GUEST e tiver duração definida
                let validUntil = null;
                if (invite.targetPlan === 'GUEST' && invite.durationDays) {
                    validUntil = new Date();
                    validUntil.setDate(validUntil.getDate() + invite.durationDays);
                }

                if (!existingArtist) {
                    await tx.artist.create({
                        data: {
                            userId: updatedUser.id,
                            plan: invite.targetPlan || 'GUEST',
                            validUntil: validUntil,
                            commissionRate: invite.targetPlan === 'RESIDENT' ? 0.30 : 0.35 // Residentes pagam menos taxa?
                        }
                    })
                } else {
                    // Update existing profile if changing plan via new invite
                    await tx.artist.update({
                        where: { id: existingArtist.id },
                        data: {
                            plan: invite.targetPlan || existingArtist.plan,
                            validUntil: validUntil || existingArtist.validUntil
                        }
                    })
                }
            }
        })

        return NextResponse.json({ success: true, role: invite.role, message: 'Convite aceito com sucesso' })

    } catch (error) {
        console.error('Error validating invite:', error)
        return NextResponse.json({ error: 'Erro interno ao validar convite' }, { status: 500 })
    }
}
