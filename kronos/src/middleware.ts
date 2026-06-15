import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Rotas que precisam de autenticação (artistas/admins)
const isProtectedRoute = createRouteMatcher([
    '/artist(.*)',
    '/dashboard(.*)',
])

// Rotas públicas (nunca exigem login)
const isPublicRoute = createRouteMatcher([
    '/',
    '/kiosk(.*)',
    '/fichas(.*)',
    '/anamnese(.*)',
    '/gift(.*)',
    '/invite(.*)',
    '/marketplace(.*)',
    '/onboarding(.*)',
    '/auth(.*)',
    '/api/auth(.*)',
    '/api/webhook(.*)',
    '/api/kiosk(.*)',
    '/api/cron(.*)',
    '/api/bookings/anamnesis(.*)',
    '/manifest.webmanifest',
])

export default clerkMiddleware(async (auth, req) => {
    // Se for rota protegida e usuário não autenticado, redireciona para sign-in
    if (isProtectedRoute(req)) {
        const { userId } = await auth()
        if (!userId) {
            const signInUrl = new URL('/onboarding', req.url)
            signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
            const response = NextResponse.redirect(signInUrl)
            response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
            return response
        }
    }
})

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|icons|brand|features|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
        '/(api|trpc)(.*)',
    ],
}
