import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/user-auth';

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (user) {
    return NextResponse.json({ user });
  }

  return NextResponse.json({ user: null }, { status: 401 });
}
