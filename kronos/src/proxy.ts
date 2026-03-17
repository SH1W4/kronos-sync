import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Definição de rotas públicas (não protegidas)
const isPublicRoute = createRouteMatcher([
  '/',
  '/simple',
  '/test-env',
  '/api/health-check',
  '/api/health',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/api/webhooks(.*)',
  '/kiosk(.*)',
  '/fichas(.*)',
  '/auth(.*)',
  '/invite(.*)',
  '/gift(.*)'
])

// Next.js 16 Proxy standard com Clerk V6
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Ignora internos do Next.js e arquivos estáticos
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Sempre executa para rotas de API
    '/(api|trpc)(.*)',
  ],
}
