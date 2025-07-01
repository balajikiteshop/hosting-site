import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'
import type { NextRequest } from 'next/server'

const secretKey = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret-key-123')

export async function signAdminToken() {
  const token = await new SignJWT({ 
    admin: true,
    iat: Date.now() / 1000
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secretKey)
  
  return token
}

export async function verifyAdminToken(request?: NextRequest) {
  try {
    let token
    if (request) {
      token = request.cookies.get('admin_token')?.value
    } else {
      token = cookies().get('admin_token')?.value
    }

    if (!token) return false

    await jwtVerify(token, secretKey)
    return true
  } catch {
    return false
  }
}

export function isValidAdminCredentials(username: string, password: string) {
  return username === process.env.ADMIN_USERNAME && 
         password === process.env.ADMIN_PASSWORD
}
