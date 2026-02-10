import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Definition of paths that SHOULD NOT be protected
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

// Next.js 16 Proxy standard
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
