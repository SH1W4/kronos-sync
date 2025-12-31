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
            const role = token.role as string

            // 1. For Professionals (Artist/Admin) -> Go to Artist Dashboard
            if (role === 'ARTIST' || role === 'ADMIN') {
                if (pathname !== '/dashboard') {
                    return NextResponse.redirect(new URL('/artist/dashboard', request.url))
                }
                return NextResponse.next()
            }

            // 2. For Clients -> Go to Kiosk if trying to access dashboard/select
            if (role === 'CLIENT') {
                if (pathname === '/dashboard' || pathname === '/auth/select') {
                    return NextResponse.redirect(new URL('/kiosk', request.url))
                }
                // Allow them to see home page or signin
                return NextResponse.next()
            }

            // 3. Default for authenticated without specific role or other routes
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/', '/auth/select', '/auth/signin', '/dashboard'],
}
