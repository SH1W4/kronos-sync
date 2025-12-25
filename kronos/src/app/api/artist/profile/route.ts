import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
    try {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        })

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const artist = await prisma.artist.findFirst({
            where: {
                userId: token.sub
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        })

        if (!artist) {
            return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
        }

        return NextResponse.json({ artist })

    } catch (error) {
        console.error('Error fetching artist profile:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
