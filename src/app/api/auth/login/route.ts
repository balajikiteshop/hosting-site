import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Check credentials against environment variables
    const validUsername = process.env.ADMIN_USERNAME
    const validPassword = process.env.ADMIN_PASSWORD

    if (!validUsername || !validPassword) {
      return new NextResponse(JSON.stringify({ error: 'Admin credentials not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (username === validUsername && password === validPassword) {
      return new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new NextResponse(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
