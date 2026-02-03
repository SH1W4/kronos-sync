import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const { userId: clerkUserId } = await auth()
        
        if (!clerkUserId) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        })

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const feedbacks = await prisma.agentFeedback.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        const formattedFeedbacks = feedbacks.map(f => ({
            id: f.id,
            type: f.type,
            message: f.message,
            status: f.status,
            createdAt: f.createdAt,
            workspaceId: f.workspaceId,
            userName: f.user.name || 'Usuário',
            userEmail: f.user.email || 'N/A'
        }))

        return NextResponse.json({ feedbacks: formattedFeedbacks })
    } catch (error) {
        console.error('Error fetching feedbacks:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { userId: clerkUserId } = await auth()
        
        if (!clerkUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId }
        })

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id, status } = await req.json()

        if (!id || !status || !['PENDING', 'REVIEWED', 'IMPLEMENTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        await prisma.agentFeedback.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating feedback:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
