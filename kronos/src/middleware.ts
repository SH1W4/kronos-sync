import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    })

    const isAuthPage = request.nextUrl.pathname.startsWith('/auth') ||
        request.nextUrl.pathname.startsWith('/onboarding')
    const isArtistPage = request.nextUrl.pathname.startsWith('/artist')
    const isPublicPage = request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname.startsWith('/kiosk') ||
        request.nextUrl.pathname.startsWith('/fichas') ||
        request.nextUrl.pathname.startsWith('/api/auth')

    // Security Headers
    const response = NextResponse.next()

    // Only add security headers in production
    if (process.env.NODE_ENV === 'production') {
        // Content Security Policy
        response.headers.set(
            'Content-Security-Policy',
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "img-src 'self' data: https: blob:; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "connect-src 'self' https://vercel.live https://*.google.com https://*.googleapis.com; " +
            "frame-ancestors 'none';"
        )

        // Security Headers
        response.headers.set('X-Frame-Options', 'DENY')
        response.headers.set('X-Content-Type-Options', 'nosniff')
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
        response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains'
        )
    }

    // Authentication logic
    if (!token && isArtistPage) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    if (token && isAuthPage) {
        const role = token.role as string
        if (role === 'ARTIST' || role === 'ADMIN') {
            return NextResponse.redirect(new URL('/artist/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
}
