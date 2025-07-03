import { NextRequest, NextResponse } from 'next/server'
import { isValidAdminCredentials, signAdminToken } from '@/lib/admin-auth'
import { clearConflictingCookies } from '@/lib/auth-security'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    if (!isValidAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = await signAdminToken()
    
    const response = NextResponse.json({ success: true })

    // Set admin JWT cookie and clear any conflicting user authentication
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    // Clear any existing user token to prevent conflicts
    return clearConflictingCookies(response, 'admin')

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
