import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'

export async function adminMiddleware(request: NextRequest) {
  // Skip auth check for login page and login API
  if (request.nextUrl.pathname === '/admin/login' || 
      request.nextUrl.pathname === '/api/admin/login') {
    return NextResponse.next()
  }

  // Check if it's an admin route
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') || 
                      request.nextUrl.pathname.startsWith('/api/admin')
  
  if (!isAdminRoute) {
    return NextResponse.next()
  }

  // Simple JWT verification
  const isAuthenticated = await verifyAdminToken(request)

  if (!isAuthenticated) {
    // Return 401 for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Redirect to login for page routes
    const url = new URL('/admin/login', request.url)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
