import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Disable caching for admin endpoints
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST() {
  const response = NextResponse.json(
    { success: true },
    { status: 200 }
  )

  response.cookies.delete('admin_token')

  return response
}
