import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
    try {
        const { userId: clerkUserId } = await auth()

        if (!clerkUserId) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { memberships: true }
        })

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 })
        }

        const activeWorkspaceId = user.memberships[0]?.workspaceId
        if (!activeWorkspaceId) {
            return NextResponse.json({ error: 'Nenhum estúdio vinculado' }, { status: 404 })
        }

        const members = await prisma.artist.findMany({
            where: {
                workspaceId: activeWorkspaceId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(members)

    } catch (error) {
        console.error('Error fetching team:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
