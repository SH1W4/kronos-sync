import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Definition of paths that SHOULD NOT be protected
// We include / because it is the landing page
const isPublicRoute = createRouteMatcher([
  '/',
  '/test-env',
  '/onboarding(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/health(.*)',
  '/api/health-check(.*)',
  '/invite(.*)',
  '/gift(.*)',
  '/auth(.*)',
  '/kiosk(.*)',
  '/fichas(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

// Although middleware.ts is standard, we keep the matcher config
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
