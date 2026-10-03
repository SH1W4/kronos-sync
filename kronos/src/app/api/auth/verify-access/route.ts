import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ authorized: false, error: 'Não autenticado' }, { status: 401 })
        }

        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)
        const clerkEmail = (clerkUser.emailAddresses[0]?.emailAddress || '').toLowerCase()

        // 1. Buscar usuário por clerkId
        let user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { memberships: { include: { workspace: true } } }
        })

        // 2. Fallback: buscar por email e vincular clerkId (race condition com webhook)
        if (!user && clerkEmail) {
            const emailUser = await prisma.user.findFirst({
                where: { email: { equals: clerkEmail, mode: 'insensitive' } }
            })

            if (emailUser) {
                user = await prisma.user.update({
                    where: { id: emailUser.id },
                    data: { clerkId: userId },
                    include: { memberships: { include: { workspace: true } } }
                })
                console.log(`[AUTH] ClerkId vinculado ao usuário existente: ${clerkEmail}`)
            }
        }

        // 3. Se ainda sem usuário, auto-provisionar como ARTIST vinculado ao workspace principal
        if (!user && clerkEmail) {
            console.log(`[AUTH] Novo usuário Clerk sem registro no banco: ${clerkEmail}. Auto-provisionando como ARTIST...`)
            const defaultWorkspace = await prisma.workspace.findFirst({
                orderBy: { createdAt: 'asc' }
            })
            if (defaultWorkspace) {
                const clerkName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkEmail.split('@')[0]
                user = await prisma.user.create({
                    data: {
                        email: clerkEmail,
                        clerkId: userId,
                        name: clerkName,
                        role: 'ARTIST',
                        artist: {
                            create: {
                                workspaceId: defaultWorkspace.id,
                                isActive: true,
                                plan: 'RESIDENT'
                            }
                        },
                        memberships: {
                            create: {
                                workspaceId: defaultWorkspace.id,
                                role: 'ARTIST'
                            }
                        }
                    },
                    include: { memberships: { include: { workspace: true } } }
                })
                console.log(`[AUTH] ✅ Auto-provisionado com sucesso: ${clerkEmail}`)
            } else {
                return NextResponse.json({
                    authorized: false,
                    role: null,
                    error: 'Nenhum workspace configurado no sistema.'
                })
            }
        }

        if (!user) {
            return NextResponse.json({
                authorized: false,
                role: null,
                error: 'Conta sem acesso ao KAIRØS. Solicite um convite ao administrador.'
            })
        }

        // 4. Sem membership = vincular automaticamente ao workspace padrão se for ARTIST ou ADMIN
        if (user.memberships.length === 0) {
            const defaultWorkspace = await prisma.workspace.findFirst({
                orderBy: { createdAt: 'asc' }
            })
            if (defaultWorkspace && (user.role === 'ARTIST' || user.role === 'ADMIN')) {
                const membership = await prisma.workspaceMember.create({
                    data: {
                        userId: user.id,
                        workspaceId: defaultWorkspace.id,
                        role: user.role
                    },
                    include: { workspace: true }
                })
                user.memberships = [membership]
                console.log(`[AUTH] Auto-vinculado ${clerkEmail} ao workspace padrão: ${defaultWorkspace.name}`)
            } else {
                console.log(`[AUTH] Usuário ${clerkEmail} sem workspace membership.`)
                return NextResponse.json({
                    authorized: false,
                    role: user.role,
                    error: 'Sua conta não está vinculada a nenhum workspace. Solicite um código de convite.'
                })
            }
        }

        const membership = user.memberships[0]
        const workspace = membership?.workspace
        // Role da membership tem prioridade sobre o global
        const resolvedRole = membership?.role || user.role

        console.log(`[AUTH] ✅ User ${clerkEmail}: role=${resolvedRole}, workspace=${workspace?.name}`)

        const newMetadata: any = { role: resolvedRole }
        if (workspace) {
            newMetadata.workspace = {
                id: workspace.id,
                name: workspace.name,
                primaryColor: workspace.primaryColor,
                logoUrl: workspace.logoUrl || '',
                capacity: workspace.capacity,
                googleCalendarId: workspace.googleCalendarId
            }
        }

        // 5. Atualizar Clerk metadata SEMPRE (idempotente, garante sincronização)
        const clerkRole = (clerkUser.publicMetadata as any)?.role
        const clerkWorkspace = (clerkUser.publicMetadata as any)?.workspace
        const metadataChanged =
            clerkRole !== resolvedRole ||
            JSON.stringify(clerkWorkspace) !== JSON.stringify(newMetadata.workspace)

        if (metadataChanged) {
            await client.users.updateUserMetadata(userId, { publicMetadata: newMetadata })
            console.log(`[AUTH] 🔄 Metadata Clerk sincronizado: ${clerkEmail} → role=${resolvedRole}`)
        }

        return NextResponse.json({
            authorized: true,
            role: resolvedRole,
            workspace: newMetadata.workspace || null
        })
    } catch (error: any) {
        console.error('[AUTH] Erro na verificação de acesso:', error)
        return NextResponse.json({ authorized: false, error: 'Erro interno na verificação' }, { status: 500 })
    }
}
