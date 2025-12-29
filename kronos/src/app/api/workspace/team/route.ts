import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions) as any

        if (!session?.activeWorkspaceId || session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 })
        }

        const members = await prisma.artist.findMany({
            where: {
                workspaceId: session.activeWorkspaceId
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
