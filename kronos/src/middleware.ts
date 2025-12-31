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
    // Se o usuário já está logado e tenta acessar rotas de entrada ou a agenda
    if (token) {
        if (pathname === '/' || pathname === '/auth/select' || pathname === '/auth/signin' || pathname === '/dashboard') {
            // Se for Arquiteto/Artista, vai direto para o dashboard dele
            if (token.role !== 'ARTIST' && token.role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/onboarding', request.url))
            }
            // Se for Arquiteto/Artista, vai direto para o dashboard dele
            if (token.role === 'ARTIST' || token.role === 'ADMIN') {
                // Se ele estiver na Home, vai pro dashboard. Se estiver no /dashboard, deixa ele ver.
                if (pathname !== '/dashboard') {
                    return NextResponse.redirect(new URL('/artist/dashboard', request.url))
                }
            }
            // Se for Cliente, NUNCA vê a agenda, vai para o Kiosk principal
            // Se for Cliente, redirecionamos para o Kiosk se ele tentar acessar áreas restritas
            if (token.role === 'CLIENT' && (pathname === '/dashboard' || pathname === '/auth/select')) {
                return NextResponse.redirect(new URL('/kiosk', request.url))
            }
        }
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/', '/auth/select', '/auth/signin', '/dashboard'],
}
