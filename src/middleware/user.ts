import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/user-auth'
import { verifyAdminToken } from '@/lib/admin-auth'

export async function userMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect checkout and orders routes
  if (pathname.startsWith('/checkout') || pathname.startsWith('/orders')) {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}
