import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/auth(.*)',
  '/api/webhooks(.*)',
  '/kiosk(.*)',
  '/fichas(.*)',
  '/api/health(.*)',
  '/api/health-check(.*)',
])

// In Next.js 16, this file is named proxy.ts
// It supports both default export and named export 'proxy'
export async function proxy(auth: any, request: any) {
  if (!isPublicRoute(request)) {
    await auth().protect()
  }
}

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
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
