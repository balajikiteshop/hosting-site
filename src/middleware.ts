import { auth } from './app/auth'
import { NextResponse } from 'next/server'
import { adminMiddleware } from './middleware/admin'
import type { NextRequest } from 'next/server'

// Add security headers to a response
function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  return response
}

// Main middleware function
export async function middleware(request: NextRequest) {
  // First check for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const adminResponse = await adminMiddleware(request)
    if (adminResponse) {
      return addSecurityHeaders(adminResponse)
    }
  }

  // For all other routes, apply standard auth and security headers
  const response = NextResponse.next()
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    // Apply middleware to all routes except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}
