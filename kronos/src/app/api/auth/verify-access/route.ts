import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ authorized: false, error: 'Não autenticado' }, { status: 401 })
        }

        // 1. Buscar o usuário com suas memberships
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { memberships: true }
        })

        // 2. Se não existir no banco ou não tiver nenhum workspace associado, revoga acesso
        if (!user || user.memberships.length === 0) {
            console.log(`[AUTH] Acesso negado para usuário ${userId}. Nenhuma credencial/workspace encontrada.`);

            // Limpa o registro do banco se ele existir sem workspace
            if (user) {
                await prisma.user.delete({
                    where: { id: user.id }
                })
            }

            // Exclui do Clerk para evitar poluição de contas não autorizadas
            try {
                const client = await clerkClient()
                await client.users.deleteUser(userId)
                console.log(`[AUTH] Usuário ${userId} excluído do Clerk com sucesso.`);
            } catch (clerkErr) {
                console.error('[AUTH] Erro ao excluir usuário do Clerk:', clerkErr)
            }

            return NextResponse.json({
                authorized: false,
                error: 'Sua conta Google não possui acesso ao KRONØS. Solicite um convite ao administrador.'
            })
        }

        return NextResponse.json({ authorized: true })
    } catch (error: any) {
        console.error('[AUTH] Erro na verificação de acesso:', error)
        return NextResponse.json({ authorized: false, error: 'Erro interno na verificação' }, { status: 500 })
    }
}
