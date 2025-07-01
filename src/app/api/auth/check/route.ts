import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authCookie = request.headers.get('cookie')?.includes('isAdminAuthenticated=true')

  if (authCookie) {
    return new NextResponse(JSON.stringify({ authenticated: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new NextResponse(JSON.stringify({ authenticated: false }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}
