import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        const { inviteCode } = await req.json()

        if (!inviteCode) {
            return NextResponse.json({ error: 'Código de convite ausente' }, { status: 400 })
        }

        // 1. Buscar o usuário atual pelo clerkId
        let user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { memberships: true, artist: true }
        })

        if (!user) {
            // Sincronização sob demanda (on-the-fly) para evitar race conditions com o webhook do Clerk
            const client = await clerkClient()
            const clerkUser = await client.users.getUser(userId)
            const email = clerkUser.emailAddresses[0]?.emailAddress
            
            if (!email) {
                return NextResponse.json({ error: 'E-mail do Clerk não encontrado' }, { status: 400 })
            }
            
            const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email.split('@')[0]
            const imageUrl = clerkUser.imageUrl

            user = await prisma.user.create({
                data: {
                    email,
                    clerkId: userId,
                    name,
                    image: imageUrl,
                    role: 'ARTIST'
                },
                include: { memberships: true, artist: true }
            })
            console.log(`[redeem-invite] Usuário ${userId} sincronizado dinamicamente.`)
        }

        // 2. Validar o convite
        const invite = await prisma.inviteCode.findUnique({
            where: { code: inviteCode, isActive: true },
            include: { workspace: true }
        })

        if (!invite) {
            return NextResponse.json({ error: 'Código de convite inválido ou inativo' }, { status: 400 })
        }

        if (invite.expiresAt && invite.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Código de convite expirado' }, { status: 400 })
        }

        if (invite.maxUses > 0 && invite.currentUses >= invite.maxUses) {
            return NextResponse.json({ error: 'Código de convite esgotado' }, { status: 400 })
        }

        // 3. Atualizar o role do usuário conforme o convite
        const targetRole = invite.role || 'ARTIST'
        await prisma.user.update({
            where: { id: user.id },
            data: { role: targetRole }
        })

        // 4. Criar membership no workspace se ainda não existir
        if (invite.workspaceId) {
            const existingMembership = await prisma.workspaceMember.findFirst({
                where: { userId: user.id, workspaceId: invite.workspaceId }
            })

            if (!existingMembership) {
                await prisma.workspaceMember.create({
                    data: {
                        userId: user.id,
                        workspaceId: invite.workspaceId,
                        role: targetRole
                    }
                })
            }

            // 5. Criar perfil de artista se ainda não existir
            if (!user.artist && targetRole === 'ARTIST') {
                await prisma.artist.create({
                    data: {
                        userId: user.id,
                        workspaceId: invite.workspaceId,
                        plan: invite.targetPlan || 'GUEST',
                        validUntil: invite.durationDays
                            ? new Date(Date.now() + invite.durationDays * 24 * 60 * 60 * 1000)
                            : null
                    }
                })
            }
        }

        // 6. Incrementar uso do convite
        await prisma.inviteCode.update({
            where: { id: invite.id },
            data: { currentUses: { increment: 1 } }
        })

        return NextResponse.json({
            success: true,
            message: 'Convite resgatado com sucesso!',
            workspace: invite.workspace?.name || null
        })

    } catch (error: any) {
        console.error('Invite Redeem Error:', error)
        return NextResponse.json({ error: 'Erro interno ao resgatar convite' }, { status: 500 })
    }
}
