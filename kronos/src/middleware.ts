import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    })

    const { pathname } = request.nextUrl

    // 1. Redirection for Authenticated Users (Sticky Route Persistence)
    // Se o usuário já está logado e tenta acessar a Home ou Seleção de Auth
    if (token) {
        if (pathname === '/' || pathname === '/auth/select' || pathname === '/auth/signin') {
            // Se for Arquiteto/Artista, vai direto para o dashboard dele
            if (token.role === 'ARTIST' || token.role === 'ADMIN') {
                return NextResponse.redirect(new URL('/artist/dashboard', request.url))
            }
            // Se for Cliente, vai para o Kiosk principal
            if (token.role === 'CLIENT') {
                return NextResponse.redirect(new URL('/kiosk', request.url))
            }
        }
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/', '/auth/select', '/auth/signin'],
}
