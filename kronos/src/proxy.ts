import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Manual route matching for Next.js 16 proxy compliance
export default clerkMiddleware(async (auth, req) => {
  const url = new URL(req.url)
  const pathname = url.pathname

  const isPublic = 
    pathname === '/' || 
    pathname === '/test-env' || 
    pathname === '/api/health-check' ||
    pathname.includes('/onboarding') || 
    pathname.includes('/sign-in') || 
    pathname.includes('/sign-up') || 
    pathname.includes('/api/health') || 
    pathname.includes('/api/webhooks') ||
    pathname.includes('/auth/') ||
    pathname.includes('/invite/') ||
    pathname.includes('/gift/')

  if (!isPublic) {
    const authObj = await auth()
    if (!authObj.userId) {
       return authObj.redirectToSignIn()
    }
  }
})

// Optional named export for Next.js 16 Proxy
export const proxy = clerkMiddleware(async (auth, req) => {
  const url = new URL(req.url)
  const pathname = url.pathname

  const isPublic = 
    pathname === '/' || 
    pathname === '/test-env' || 
    pathname === '/api/health-check' ||
    pathname.includes('/onboarding') || 
    pathname.includes('/sign-in') || 
    pathname.includes('/sign-up') || 
    pathname.includes('/api/health') || 
    pathname.includes('/api/webhooks')

  if (!isPublic) {
    const authObj = await auth()
    if (!authObj.userId) {
       return authObj.redirectToSignIn()
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
