import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ authorized: false, error: 'Não autenticado' }, { status: 401 })
        }

        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)

        let user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { memberships: { include: { workspace: true } } }
        })

        if (!user) {
            const email = (clerkUser.emailAddresses[0]?.emailAddress || '').toLowerCase()
            if (email) {
                const emailUser = await prisma.user.findUnique({
                    where: { email }
                })

                if (emailUser) {
                    await prisma.user.update({
                        where: { id: emailUser.id },
                        data: { clerkId: userId }
                    })

                    user = await prisma.user.findUnique({
                        where: { id: emailUser.id },
                        include: { memberships: { include: { workspace: true } } }
                    })
                }
            }
        }

        if (!user || user.memberships.length === 0) {
            console.log(`[AUTH] Acesso negado para usuário ${userId}. Nenhum workspace encontrado.`)
            return NextResponse.json({
                authorized: false,
                error: 'Sua conta Google não possui acesso ao KAIRØS. Solicite um convite ao administrador.'
            })
        }

        const membership = user.memberships[0]
        const workspace = membership?.workspace
        // Usar o papel da membership do workspace, não o papel global do usuário
        const resolvedRole = membership?.role || user.role
        const metadata: any = { role: resolvedRole }

        if (workspace) {
            metadata.workspace = {
                id: workspace.id,
                name: workspace.name,
                primaryColor: workspace.primaryColor,
                logoUrl: workspace.logoUrl,
                capacity: workspace.capacity,
                googleCalendarId: workspace.googleCalendarId
            }
        }

        const clerkRole = (clerkUser.publicMetadata as any)?.role
        const clerkWorkspace = (clerkUser.publicMetadata as any)?.workspace

        if (clerkRole !== resolvedRole || JSON.stringify(clerkWorkspace) !== JSON.stringify(metadata.workspace)) {
            await client.users.updateUserMetadata(userId, {
                publicMetadata: metadata
            })
            console.log(`[AUTH] Metadata Clerk atualizado para usuário ${userId}: role=${resolvedRole}`)
        }

        return NextResponse.json({ authorized: true, role: resolvedRole, workspace: metadata.workspace || null })
    } catch (error: any) {
        console.error('[AUTH] Erro na verificação de acesso:', error)
        return NextResponse.json({ authorized: false, error: 'Erro interno na verificação' }, { status: 500 })
    }
}
