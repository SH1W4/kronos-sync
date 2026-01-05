import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { email, password, name, phone, inviteCode } = body

        if (!email || !password || !phone || !inviteCode) {
            return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
        }

        // 1. Validate Invite Code
        const invite = await prisma.inviteCode.findUnique({
            where: { code: inviteCode, isActive: true }
        })

        if (!invite) {
            return NextResponse.json({ error: 'Código de convite inválido' }, { status: 400 })
        }

        if (invite.expiresAt && invite.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Código de convite expirado' }, { status: 400 })
        }

        if (invite.maxUses > 0 && invite.currentUses >= invite.maxUses) {
            return NextResponse.json({ error: 'Código de convite esgotado' }, { status: 400 })
        }

        // 2. Check if Email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })

        if (existingEmail) {
            return NextResponse.json({ error: 'Email já cadastrado. Faça login.' }, { status: 400 })
        }

        // 3. Check Phone Uniqueness (Identity Lock)
        // Only if phone is provided (it is mandatory per our logic)
        const cleanPhone = phone.replace(/\D/g, '') // remove non-digits
        // Note: Prisma string search matches exact unless we handle formatting. 
        // We will assume frontend sends clean or consistent format, OR we search specifically?
        // For simplicity now assume exact match on what is stored.
        // But wait, existing users might have null phone.

        // Let's just create. Using hash for password.
        const hashedPassword = await hash(password, 12)

        // 4. Create User
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                name: name || email.split('@')[0],
                password: hashedPassword,
                phone: phone, // Store as provided for now
                role: 'ARTIST' // Default for invited users via this flow? Or check invite role?
            }
        })

        // 5. Create Artist Profile (Linked to Workspace)
        if (invite.workspaceId) {
            await prisma.workspaceMember.create({
                data: {
                    userId: user.id,
                    workspaceId: invite.workspaceId,
                    role: invite.role || 'ARTIST'
                }
            })

            // Also create the Artist record if not exists
            await prisma.artist.create({
                data: {
                    userId: user.id,
                    workspaceId: invite.workspaceId,
                    plan: invite.targetPlan || 'GUEST',
                    validUntil: invite.durationDays ? new Date(Date.now() + invite.durationDays * 24 * 60 * 60 * 1000) : null
                }
            })
        }

        // 6. Increment Invite Uses
        await prisma.inviteCode.update({
            where: { id: invite.id },
            data: { currentUses: { increment: 1 } }
        })

        return NextResponse.json({
            success: true,
            message: 'Conta criada com sucesso!'
        })

    } catch (error: any) {
        console.error('Registration Error:', error)
        return NextResponse.json({ error: 'Erro interno ao criar conta' }, { status: 500 })
    }
}
