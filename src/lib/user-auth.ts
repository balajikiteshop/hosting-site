import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
}

export function signUserToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyUserToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<UserPayload | null> {
  const token = request.cookies.get('user_token')?.value;
  
  if (!token) {
    return null;
  }

  return verifyUserToken(token);
}

export async function getUserFromCookies(): Promise<UserPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('user_token')?.value;
  
  if (!token) {
    return null;
  }

  return verifyUserToken(token);
}
