import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'

export async function adminMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Only handle admin routes
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return null
  }

  // Skip auth check for login page and login API
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return null // Let the request proceed normally
  }

  // Verify admin authentication
  const isAuthenticated = await verifyAdminToken(request)

  if (!isAuthenticated) {
    // Return 401 for API routes
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Redirect to login for page routes
    const url = new URL('/admin/login', request.url)
    return NextResponse.redirect(url)
  }

  // Admin is authenticated, let request proceed
  return null
}
