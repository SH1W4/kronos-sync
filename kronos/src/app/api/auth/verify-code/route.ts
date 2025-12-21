import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { email, code } = await req.json()

        if (!email || !code) {
            return NextResponse.json({ error: 'Email e código são obrigatórios' }, { status: 400 })
        }

        // Find verification code
        const verificationCode = await prisma.verificationCode.findFirst({
            where: {
                email: email.toLowerCase(),
                code: code.trim(),
                used: false,
                expiresAt: { gte: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        })

        if (!verificationCode) {
            return NextResponse.json({
                error: 'Código inválido ou expirado'
            }, { status: 400 })
        }

        // Mark code as used
        await prisma.verificationCode.update({
            where: { id: verificationCode.id },
            data: { used: true }
        })

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })

        if (!user) {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email: email.toLowerCase(),
                    name: email.split('@')[0], // Temporary name
                    role: 'CLIENT' // Default role, will be upgraded via invite code
                }
            })
        }

        // Return success with user data
        // The actual session will be created by NextAuth
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            message: 'Código verificado com sucesso!'
        })

    } catch (error) {
        console.error('Error verifying code:', error)
        return NextResponse.json({
            error: 'Erro interno do servidor'
        }, { status: 500 })
    }
}
