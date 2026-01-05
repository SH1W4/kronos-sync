import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json()

        if (!token || !password) {
            return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
        }

        // 1. Validate Token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token }
        })

        if (!resetToken) {
            return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 400 })
        }

        if (resetToken.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Link expirado. Solicite novo reset.' }, { status: 400 })
        }

        // 2. Hash New Password
        const hashedPassword = await hash(password, 12)

        // 3. Update User
        await prisma.user.update({
            where: { email: resetToken.email },
            data: { password: hashedPassword }
        })

        // 4. Delete Used Token (and potentially other tokens for this user)
        await prisma.passwordResetToken.deleteMany({
            where: { email: resetToken.email }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Reset Confirm Error:', error)
        return NextResponse.json({ error: 'Erro interno ao redefinir senha' }, { status: 500 })
    }
}
