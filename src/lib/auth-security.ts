import { NextRequest, NextResponse } from 'next/server';

/**
 * Security utility to prevent authentication conflicts between user and admin sessions
 */

export function clearConflictingCookies(response: NextResponse, authType: 'user' | 'admin') {
  if (authType === 'user') {
    // When user logs in, clear any existing admin token
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
    });
  } else if (authType === 'admin') {
    // When admin logs in, clear any existing user token
    response.cookies.set('user_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
    });
  }
  
  return response;
}

export function hasConflictingAuth(request: NextRequest): boolean {
  const userToken = request.cookies.get('user_token')?.value;
  const adminToken = request.cookies.get('admin_token')?.value;
  
  // Return true if both tokens exist (conflicting authentication)
  return !!(userToken && adminToken);
}

export function clearAllAuthCookies(response: NextResponse) {
  // Clear both user and admin tokens
  response.cookies.set('user_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
  });
  
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
  });
  
  return response;
}
