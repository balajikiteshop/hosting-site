import { NextResponse } from 'next/server'
import { isValidAdminCredentials, signAdminToken } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Check credentials against environment variables
    const validCreds = await isValidAdminCredentials(username, password)

    if (!validCreds) {
      return new NextResponse(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Generate JWT token
    const token = await signAdminToken()
    const response = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

    // Set HTTP-only cookie with JWT token
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 1 day
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
