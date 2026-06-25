import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        // Buscar usuários com nome "Gabriella"
        const usersByName = await prisma.user.findMany({
            where: {
                name: {
                    contains: 'gabriella',
                    mode: 'insensitive'
                }
            },
            include: {
                memberships: {
                    include: {
                        workspace: true
                    }
                },
                artist: true
            }
        })

        // Buscar todos os usuários recentes (últimos 7 dias)
        const recentUsers = await prisma.user.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            },
            include: {
                memberships: {
                    include: {
                        workspace: true
                    }
                },
                artist: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20
        })

        // Buscar convites recentes
        const recentInvites = await prisma.inviteCode.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            },
            include: {
                workspace: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20
        })

        // Buscar workspaces
        const workspaces = await prisma.workspace.findMany({
            include: {
                members: {
                    include: {
                        user: true
                    }
                }
            }
        })

        return NextResponse.json({
            status: 'success',
            data: {
                gabriellaUsers: usersByName.map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    clerkId: u.clerkId,
                    artist: u.artist ? {
                        id: u.artist.id,
                        plan: u.artist.plan,
                        validUntil: u.artist.validUntil,
                        calendarSyncEnabled: u.artist.calendarSyncEnabled
                    } : null,
                    memberships: u.memberships.map(m => ({
                        workspaceId: m.workspaceId,
                        workspaceName: m.workspace.name,
                        role: m.role
                    }))
                })),
                recentUsers: recentUsers.map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    clerkId: u.clerkId,
                    createdAt: u.createdAt,
                    artist: u.artist ? {
                        id: u.artist.id,
                        plan: u.artist.plan
                    } : null,
                    membershipsCount: u.memberships.length
                })),
                recentInvites: recentInvites.map(i => ({
                    code: i.code,
                    role: i.role,
                    targetPlan: i.targetPlan,
                    workspaceName: i.workspace?.name || 'N/A',
                    currentUses: i.currentUses,
                    maxUses: i.maxUses,
                    expiresAt: i.expiresAt,
                    createdAt: i.createdAt
                })),
                workspaces: workspaces.map(w => ({
                    id: w.id,
                    name: w.name,
                    membersCount: w.members.length,
                    members: w.members.map(m => ({
                        userName: m.user.name,
                        userEmail: m.user.email,
                        role: m.role
                    }))
                }))
            }
        })

    } catch (error: any) {
        console.error('[DIAGNOSTIC] Error:', error)
        return NextResponse.json({
            status: 'error',
            message: 'Erro ao processar diagnóstico',
            error: error.message
        }, { status: 500 })
    }
}
