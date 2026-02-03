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
        const { code, phone } = body

        if (!code) {
            return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
        }

        if (!phone || phone.length < 8) {
            return NextResponse.json({ error: 'Celular obrigatório para vincular credencial.' }, { status: 400 })
        }

        const cleanCode = code.trim()

        // 1. MASTER KEY CHECK (Environment Variable)
        if (process.env.KRONOS_TEAM_KEY && cleanCode === process.env.KRONOS_TEAM_KEY) {
            // Already checked above as 'user'

            // Busca ou Cria o Workspace principal
            let workspace = await prisma.workspace.findFirst({ where: { slug: 'kronos-studio' } })
            if (!workspace) {
                workspace = await prisma.workspace.create({
                    data: {
                        name: 'Kronos Studio',
                        slug: 'kronos-studio',
                        ownerId: user.id,
                        capacity: 3
                    }
                })
            }

            // Update User and Membership
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: user.id },
                    data: {
                        role: 'ADMIN',
                        phone: phone
                    }
                }),
                prisma.workspaceMember.upsert({
                    where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
                    create: { workspaceId: workspace.id, userId: user.id, role: 'ADMIN' },
                    update: { role: 'ADMIN' }
                }),
                prisma.artist.upsert({
                    where: { userId: user.id },
                    create: {
                        userId: user.id,
                        workspaceId: workspace.id,
                        plan: 'RESIDENT',
                        commissionRate: 0.85
                    },
                    update: {
                        plan: 'RESIDENT',
                        workspaceId: workspace.id
                    }
                })
            ])

            return NextResponse.json({ success: true, role: 'ADMIN', message: 'Bem-vindo ao Workspace Mestre.' })
        }

        // 2. DATABASE INVITE CODE CHECK
        const invite = await prisma.inviteCode.findUnique({
            where: { code: cleanCode },
            include: { creator: true, workspace: true }
        })

        if (!invite) return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
        if (!invite.isActive) return NextResponse.json({ error: 'Código inativo' }, { status: 400 })

        // Check Expiration
        if (invite.expiresAt && invite.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Este código expirou' }, { status: 400 })
        }

        // Check Usage Limit
        if (invite.maxUses > 0 && invite.currentUses >= invite.maxUses) {
            return NextResponse.json({ error: 'Este código atingiu o limite de usos' }, { status: 400 })
        }

        // Execute Transaction
        await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: {
                    role: invite.role,
                    invitedById: invite.creatorId,
                    phone: phone
                }
            })

            // Add Membership to the Workspace
            if (invite.workspaceId) {
                await tx.workspaceMember.upsert({
                    where: { workspaceId_userId: { workspaceId: invite.workspaceId, userId: updatedUser.id } },
                    create: { workspaceId: invite.workspaceId, userId: updatedUser.id, role: invite.role },
                    update: { role: invite.role }
                })
            }

            await tx.inviteCode.update({
                where: { id: invite.id },
                data: { currentUses: { increment: 1 } }
            })

            if (invite.role === 'ARTIST' || invite.role === 'ADMIN') {
                const existingArtist = await tx.artist.findUnique({ where: { userId: updatedUser.id } })

                let validUntil = null;
                if (invite.targetPlan === 'GUEST' && invite.durationDays) {
                    validUntil = new Date();
                    validUntil.setDate(validUntil.getDate() + invite.durationDays);
                }

                if (!existingArtist) {
                    await tx.artist.create({
                        data: {
                            userId: updatedUser.id,
                            workspaceId: invite.workspaceId,
                            plan: invite.targetPlan || 'GUEST',
                            validUntil: validUntil,
                            commissionRate: invite.targetPlan === 'RESIDENT' ? 0.30 : 0.35
                        }
                    })
                } else {
                    await tx.artist.update({
                        where: { id: existingArtist.id },
                        data: {
                            plan: invite.targetPlan || existingArtist.plan,
                            workspaceId: invite.workspaceId || existingArtist.workspaceId,
                            validUntil: validUntil || existingArtist.validUntil
                        }
                    })
                }
            }
        })

        // 3. Update Clerk Metadata
        const client = await clerkClient()
        await client.users.updateUserMetadata(clerkUserId, {
            publicMetadata: {
                role: invite?.role || 'ADMIN' // Se for Master Key, role é ADMIN
            }
        })

        return NextResponse.json({ success: true, role: invite.role, message: 'Convite aceito com sucesso' })

    } catch (error) {
        console.error('Error validating invite:', error)
        return NextResponse.json({ error: 'Erro interno ao validar convite' }, { status: 500 })
    }
}
