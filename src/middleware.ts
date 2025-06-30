import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add security headers to all responses
  const response = NextResponse.next()
  
  // Security headers
  const securityHeaders = new Headers(response.headers)
  securityHeaders.set('X-DNS-Prefetch-Control', 'on')
  securityHeaders.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  securityHeaders.set('X-XSS-Protection', '1; mode=block')
  securityHeaders.set('X-Frame-Options', 'SAMEORIGIN')
  securityHeaders.set('X-Content-Type-Options', 'nosniff')
  securityHeaders.set('Referrer-Policy', 'origin-when-cross-origin')
  
  // Check if it's an admin route
  const path = request.nextUrl.pathname
  if (path.startsWith('/admin')) {
    const authCookie = request.cookies.get('isAdminAuthenticated')
    const isAuthenticated = authCookie?.value === 'true'

    // If not authenticated or cookie is invalid, redirect to login
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Apply security headers to the response
  const finalResponse = NextResponse.next()
  securityHeaders.forEach((value, key) => {
    finalResponse.headers.set(key, value)
  })
  return finalResponse
}

export const config = {
  matcher: '/admin/:path*',
}
