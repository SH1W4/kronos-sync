import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
    try {
        console.log('🧹 Limpando usuário Dev anterior...')

        // Deleta usuário dev (cascade vai deletar artist também)
        const deleted = await prisma.user.deleteMany({
            where: {
                email: 'dev@kronos.com'
            }
        })

        console.log(`✅ Deletados ${deleted.count} usuários Dev`)

        return NextResponse.json({
            success: true,
            message: `Deletados ${deleted.count} usuários Dev`,
            count: deleted.count
        })
    } catch (error: any) {
        console.error('❌ Erro ao limpar:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
