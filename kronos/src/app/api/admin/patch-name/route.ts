import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * ROTA TEMPORÁRIA DE PATCH
 * Acesse: GET /api/admin/patch-name
 * Remove este arquivo após usar.
 */
export async function GET() {
    try {
        const { userId: clerkUserId } = await auth()

        if (!clerkUserId) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        // Buscar o usuário atual pelo Clerk ID
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { id: true, name: true, email: true, role: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado no banco' }, { status: 404 })
        }

        const nomePrevio = user.name

        // Atualizar o nome
        await prisma.user.update({
            where: { id: user.id },
            data: { name: 'KRS ADM' }
        })

        // Sincronizar com o Clerk
        try {
            const { clerkClient } = await import('@clerk/nextjs/server')
            const client = await clerkClient()
            await client.users.updateUser(clerkUserId, {
                firstName: 'KRS',
                lastName: 'ADM'
            })
        } catch (clerkErr) {
            console.error('Erro ao sincronizar com Clerk:', clerkErr)
        }

        return NextResponse.json({
            success: true,
            message: `✅ Nome atualizado: "${nomePrevio}" → "KRS ADM"`,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                novoNome: 'KRS ADM'
            }
        })

    } catch (error: any) {
        console.error('Patch error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
