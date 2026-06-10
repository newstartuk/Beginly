import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  // Clear auth cookies
  response.cookies.set('nsk_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  response.cookies.set('nsk_is_admin', '', {
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}

export async function GET() {
  return POST();
}
