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

        // 2. Se não existir no banco ou não tiver nenhum workspace associado, retorna não autorizado
        // NOTA: Não deletamos o usuário aqui — pode ser uma race condition com o webhook do Clerk
        if (!user || user.memberships.length === 0) {
            console.log(`[AUTH] Acesso negado para usuário ${userId}. Nenhum workspace encontrado.`);
            return NextResponse.json({
                authorized: false,
                error: 'Sua conta Google não possui acesso ao KAIRØS. Solicite um convite ao administrador.'
            })
        }

        return NextResponse.json({ authorized: true })
    } catch (error: any) {
        console.error('[AUTH] Erro na verificação de acesso:', error)
        return NextResponse.json({ authorized: false, error: 'Erro interno na verificação' }, { status: 500 })
    }
}
