import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

        // Verificar se usuário tem workspace membership
        try {
            const user = await prisma.user.findUnique({
                where: { clerkId: userId },
                include: { memberships: true, artist: true }
            })

            // Se for ARTIST ou ADMIN ou tiver perfil de artista, permite acesso direto
            if (user?.role === 'ARTIST' || user?.role === 'ADMIN' || user?.artist) {
                return NextResponse.next()
            }

            if (!user) {
                return NextResponse.json(
                    { error: 'Usuário não autorizado' },
                    { status: 403 }
                )
            }

            if (user.memberships.length === 0) {
                console.log(`[MIDDLEWARE] Usuário ${userId} sem workspace, redirecionando para onboarding`)
                const onboardingUrl = new URL('/onboarding', req.url)
                onboardingUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
                onboardingUrl.searchParams.set('noWorkspace', 'true')
                const response = NextResponse.redirect(onboardingUrl)
                response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
                return response
            }
        } catch (error) {
            console.error('[MIDDLEWARE] Erro ao verificar workspace:', error)
            return NextResponse.json(
                { error: 'Não foi possível validar a autorização' },
                { status: 503 }
            )
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
