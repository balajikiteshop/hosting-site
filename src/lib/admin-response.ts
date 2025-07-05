import { NextResponse } from 'next/server'

/**
 * Creates a NextResponse with cache-busting headers for admin endpoints
 * This ensures that admin data is always fresh and never cached
 */
export function createAdminResponse(data: any, options?: { status?: number }) {
  const response = NextResponse.json(data, { status: options?.status || 200 })
  
  // Add cache control headers to prevent caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('Last-Modified', new Date().toUTCString())
  
  return response
}

/**
 * Creates an error response with cache-busting headers for admin endpoints
 */
export function createAdminErrorResponse(error: string, status: number = 500) {
  return createAdminResponse({ error }, { status })
}
