import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
    try {
        const { email, name } = await req.json()

        if (!email) {
            return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
        }

        // 1. Buscar usuário no Clerk
        const client = await clerkClient()
        const clerkUsers = await client.users.getUserList({
            emailAddress: [email.toLowerCase()]
        })

        if (clerkUsers.data.length === 0) {
            return NextResponse.json({ error: 'Usuário não encontrado no Clerk' }, { status: 404 })
        }

        const clerkUser = clerkUsers.data[0]
        const clerkId = clerkUser.id
        const clerkName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || name || email.split('@')[0]
        const clerkEmail = clerkUser.emailAddresses[0]?.emailAddress || email.toLowerCase()
        const clerkImage = clerkUser.imageUrl

        console.log(`[SYNC-GABRIELLA] Usuário encontrado no Clerk: ${clerkId}, ${clerkEmail}`)

        // 2. Verificar se já existe no banco
        let user = await prisma.user.findUnique({
            where: { clerkId },
            include: { memberships: true, artist: true }
        })

        if (!user) {
            // Criar usuário no banco
            user = await prisma.user.create({
                data: {
                    email: clerkEmail,
                    clerkId: clerkId,
                    name: clerkName,
                    image: clerkImage,
                    role: 'ARTIST'
                },
                include: { memberships: true, artist: true }
            })
            console.log(`[SYNC-GABRIELLA] Usuário criado no banco: ${user.id}`)
        }

        // 3. Buscar o workspace KRONOS HQ
        const workspace = await prisma.workspace.findFirst({
            where: { name: 'KRONOS HQ' }
        })

        if (!workspace) {
            return NextResponse.json({ error: 'Workspace KRONOS HQ não encontrado' }, { status: 404 })
        }

        // 4. Verificar se já tem membership
        const existingMembership = await prisma.workspaceMember.findFirst({
            where: { userId: user.id, workspaceId: workspace.id }
        })

        if (existingMembership) {
            return NextResponse.json({ 
                success: true,
                message: 'Usuário já tem membership no workspace',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                membership: existingMembership
            })
        }

        // 5. Criar membership
        const membership = await prisma.workspaceMember.create({
            data: {
                userId: user.id,
                workspaceId: workspace.id,
                role: 'ARTIST'
            }
        })
        console.log(`[SYNC-GABRIELLA] Membership criado: ${membership.id}`)

        // 6. Atualizar role do usuário para ARTIST se necessário
        if (user.role !== 'ARTIST') {
            await prisma.user.update({
                where: { id: user.id },
                data: { role: 'ARTIST' }
            })
        }

        // 7. Criar perfil de artista se não existir
        if (!user.artist) {
            await prisma.artist.create({
                data: {
                    userId: user.id,
                    workspaceId: workspace.id,
                    plan: 'RESIDENT',
                    validUntil: null
                }
            })
            console.log(`[SYNC-GABRIELLA] Perfil de artista criado`)
        }

        // 8. Atualizar metadata do Clerk
        await client.users.updateUserMetadata(clerkId, {
            publicMetadata: {
                role: 'ARTIST',
                workspace: {
                    id: workspace.id,
                    name: workspace.name,
                    primaryColor: workspace.primaryColor,
                    logoUrl: workspace.logoUrl,
                    capacity: workspace.capacity,
                    googleCalendarId: workspace.googleCalendarId
                }
            }
        })
        console.log(`[SYNC-GABRIELLA] Metadata do Clerk atualizado`)

        return NextResponse.json({
            success: true,
            message: 'Gabriella sincronizada e associada ao workspace com sucesso',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: 'ARTIST',
                clerkId: clerkId
            },
            membership: {
                workspaceId: workspace.id,
                workspaceName: workspace.name,
                role: 'ARTIST'
            }
        })

    } catch (error: any) {
        console.error('[SYNC-GABRIELLA] Error:', error)
        return NextResponse.json({
            status: 'error',
            message: 'Erro ao sincronizar e corrigir acesso',
            error: error.message
        }, { status: 500 })
    }
}
