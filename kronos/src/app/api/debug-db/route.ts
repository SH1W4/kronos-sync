import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Teste de conexão e schema
        const count = await prisma.user.count()

        return NextResponse.json({
            status: 'SUCCESS',
            message: 'Database is connected and tables exist!',
            userCount: count,
            checks: {
                NEXTAUTH_URL: process.env.NEXTAUTH_URL,
                HAS_GOOGLE_ID: !!process.env.GOOGLE_CLIENT_ID,
                HAS_GOOGLE_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
                HAS_NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
            }
        })
    } catch (error: any) {
        return NextResponse.json({
            status: 'CRITICAL_ERROR',
            error: error.message,
            code: error.code,
            meta: error.meta
        }, { status: 500 })
    }
}
