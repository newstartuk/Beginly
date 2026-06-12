import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email?.includes('@') || !password) {
      return NextResponse.json(
        { error: 'Please enter your email and password.' },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Find user by email
    const { data: user, error } = await admin
      .from('users')
      .select('id, name, email, password_hash, is_admin, profile_completed')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'No account found with that email. Please check and try again.' },
        { status: 401 }
      );
    }

    // Verify password
    const crypto = await import('crypto');
    const [salt, hash] = user.password_hash.split(':');
    const verifyHash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex');

    if (hash !== verifyHash) {
      return NextResponse.json(
        { error: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    // Sign JWT
    const token = signToken(user);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, profileCompleted: user.profile_completed },
    });

    response.cookies.set('nsk_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    response.cookies.set('nsk_is_admin', String(user.is_admin), {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

function signToken(user: any): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.is_admin,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30),
  }));

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  const crypto = require('crypto');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}
