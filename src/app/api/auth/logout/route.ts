import { NextResponse } from 'next/server'

export async function POST() {
  const response = new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

  // Clear the authentication cookie
  response.cookies.set('isAdminAuthenticated', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0)
  })

  return response
}
