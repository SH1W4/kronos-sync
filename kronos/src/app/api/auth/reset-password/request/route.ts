import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })

        // SECURITY: Always return success even if user not found to prevent enumeration
        if (!user) {
            return NextResponse.json({ success: true })
        }

        // Generate Token
        const token = uuidv4()
        const expiresAt = new Date(Date.now() + 3600 * 1000) // 1 hour

        // Prevent spam: check if there is a recent active token?
        // For simplicity, just create a new one.

        // Save Token
        await prisma.passwordResetToken.create({
            data: {
                email: user.email!,
                token,
                expiresAt
            }
        })

        // Send Email
        await sendPasswordResetEmail(user.email!, token)

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Reset Request Error:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
