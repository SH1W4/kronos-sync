import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { email, name } = await req.json()

        if (!email) {
            return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
        }

        // 1. Buscar usuário pelo email
        let user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: { memberships: true, artist: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado no banco de dados' }, { status: 404 })
        }

        // 2. Buscar o workspace KRONOS HQ
        const workspace = await prisma.workspace.findFirst({
            where: { name: 'KRONOS HQ' }
        })

        if (!workspace) {
            return NextResponse.json({ error: 'Workspace KRONOS HQ não encontrado' }, { status: 404 })
        }

        // 3. Verificar se já tem membership
        const existingMembership = await prisma.workspaceMember.findFirst({
            where: { userId: user.id, workspaceId: workspace.id }
        })

        if (existingMembership) {
            return NextResponse.json({ 
                error: 'Usuário já tem membership no workspace',
                membership: existingMembership
            }, { status: 400 })
        }

        // 4. Criar membership
        const membership = await prisma.workspaceMember.create({
            data: {
                userId: user.id,
                workspaceId: workspace.id,
                role: 'ARTIST'
            }
        })

        // 5. Atualizar role do usuário para ARTIST se necessário
        if (user.role !== 'ARTIST') {
            await prisma.user.update({
                where: { id: user.id },
                data: { role: 'ARTIST' }
            })
        }

        // 6. Criar perfil de artista se não existir
        if (!user.artist) {
            await prisma.artist.create({
                data: {
                    userId: user.id,
                    workspaceId: workspace.id,
                    plan: 'RESIDENT',
                    validUntil: null
                }
            })
        }

        // 7. Atualizar nome se fornecido
        if (name && user.name !== name) {
            await prisma.user.update({
                where: { id: user.id },
                data: { name }
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Gabriella associada ao workspace com sucesso',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: 'ARTIST'
            },
            membership: {
                workspaceId: workspace.id,
                workspaceName: workspace.name,
                role: 'ARTIST'
            }
        })

    } catch (error: any) {
        console.error('[FIX-GABRIELLA] Error:', error)
        return NextResponse.json({
            status: 'error',
            message: 'Erro ao corrigir acesso',
            error: error.message
        }, { status: 500 })
    }
}
