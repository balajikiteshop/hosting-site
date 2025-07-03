import { NextResponse } from 'next/server'
import { adminMiddleware } from './middleware/admin'
import { userMiddleware } from './middleware/user'
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
  const { pathname } = request.nextUrl

  // Handle admin routes - complete separation from user routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const adminResponse = await adminMiddleware(request)
    if (adminResponse) {
      return addSecurityHeaders(adminResponse)
    }
    // If admin middleware passes, continue with standard headers
    const response = NextResponse.next()
    return addSecurityHeaders(response)
  }

  // Handle user routes - only for non-admin routes
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    const userResponse = await userMiddleware(request)
    if (userResponse.status === 302) { // Redirect response
      return addSecurityHeaders(userResponse)
    }
  }

  // For all other routes, apply standard security headers
  const response = NextResponse.next()
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    // Apply middleware to all routes except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}
