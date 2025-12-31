import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationCode, generateVerificationCode } from '@/lib/email'

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
        }

        // Rate limiting: max 3 codes per hour per email
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const recentCodes = await prisma.verificationCode.count({
            where: {
                email: email.toLowerCase(),
                createdAt: { gte: oneHourAgo }
            }
        })

        if (recentCodes >= 3) {
            return NextResponse.json({
                error: 'Muitas tentativas. Aguarde 1 hora.'
            }, { status: 429 })
        }

        // Generate code
        const code = generateVerificationCode()
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

        // Save to database
        await prisma.verificationCode.create({
            data: {
                email: email.toLowerCase(),
                code,
                expiresAt
            }
        })

        // Send email
        const emailResult = await sendVerificationCode(email, code)

        // EMERGENCY LOG: Always log the code to Vercel/Terminal for manual intervention
        console.log(`🔑 [AUTH] Código para ${email}: ${code}`)

        if (!emailResult.success) {
            return NextResponse.json({
                error: 'Erro ao enviar email. Tente novamente.'
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Código enviado para seu email!'
        })

    } catch (error) {
        console.error('Error sending verification code:', error)
        return NextResponse.json({
            error: 'Erro interno do servidor'
        }, { status: 500 })
    }
}
