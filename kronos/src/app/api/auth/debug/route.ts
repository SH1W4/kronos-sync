import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    // Proteção: Só funciona em desenvolvimento
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    try {
        const { userId } = await auth()
        
        if (!userId) {
            return NextResponse.json({
                status: 'not_authenticated',
                message: 'Usuário não autenticado'
            }, { status: 401 })
        }

        // 1. Pegar dados do Clerk
        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)
        
        // 2. Pegar dados do banco de dados
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: {
                memberships: {
                    include: { workspace: true }
                },
                artist: true
            }
        })

        // 3. Se não encontrou por clerkId, tenta por email
        let userByEmail = null
        if (!user && clerkUser.emailAddresses[0]) {
            const email = clerkUser.emailAddresses[0].emailAddress.toLowerCase()
            userByEmail = await prisma.user.findUnique({
                where: { email },
                include: {
                    memberships: {
                        include: { workspace: true }
                    },
                    artist: true
                }
            })
        }

        const debugData = {
            clerk: {
                userId: clerkUser.id,
                email: clerkUser.emailAddresses[0]?.emailAddress || 'No email',
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                publicMetadata: clerkUser.publicMetadata || {},
                createdAt: clerkUser.createdAt
            },
            database: {
                foundByClerkId: !!user,
                foundByEmail: !!userByEmail,
                user: user ? {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    clerkId: user.clerkId,
                    memberships: user.memberships.map(m => ({
                        workspaceId: m.workspaceId,
                        workspaceName: m.workspace.name,
                        role: m.role
                    })),
                    hasArtistProfile: !!user.artist
                } : null,
                userByEmail: userByEmail ? {
                    id: userByEmail.id,
                    email: userByEmail.email,
                    name: userByEmail.name,
                    role: userByEmail.role,
                    clerkId: userByEmail.clerkId,
                    memberships: userByEmail.memberships.map(m => ({
                        workspaceId: m.workspaceId,
                        workspaceName: m.workspace.name,
                        role: m.role
                    })),
                    hasArtistProfile: !!userByEmail.artist
                } : null
            },
            analysis: {
                status: 'OK',
                issues: [] as string[]
            }
        }

        // Análise
        if (!user && !userByEmail) {
            debugData.analysis.status = 'ERROR'
            debugData.analysis.issues.push('❌ Usuário NÃO encontrado no banco de dados (nem por clerkId nem por email)')
        } else if (!user && userByEmail) {
            debugData.analysis.issues.push('⚠️ Usuário encontrado por email, mas clerkId não sincronizado')
        }

        const finalUser = user || userByEmail
        if (finalUser) {
            if (finalUser.memberships.length === 0) {
                debugData.analysis.status = 'ERROR'
                debugData.analysis.issues.push('❌ Usuário NÃO tem nenhuma membership em workspace')
            }

            const membership = finalUser.memberships[0]
            if (membership?.role !== 'ARTIST' && membership?.role !== 'ADMIN') {
                debugData.analysis.issues.push(`⚠️ Role da membership é "${membership?.role}", esperado "ARTIST" ou "ADMIN"`)
            }

            const clerkRole = (clerkUser.publicMetadata as any)?.role
            if (clerkRole !== membership?.role) {
                debugData.analysis.issues.push(`⚠️ Clerk role (${clerkRole}) diferente da DB role (${membership?.role})`)
            }

            if (!finalUser.artist) {
                debugData.analysis.issues.push(`⚠️ Usuário não tem perfil de artista criado`)
            }
        }

        return NextResponse.json(debugData, { status: 200 })
    } catch (error: any) {
        console.error('[DEBUG] Error:', error)
        return NextResponse.json({
            status: 'error',
            message: 'Erro ao processar debug',
            error: error.message
        }, { status: 500 })
    }
}
