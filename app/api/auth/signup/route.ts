import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name?.trim() || !email?.includes('@') || !password || password.length < 8) {
      return NextResponse.json(
        { error: 'Name, valid email, and password (min 8 chars) are required' },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Check if user already exists
    const { data: existing } = await admin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (simple hash for MVP — upgrade to bcrypt in production)
    const crypto = await import('crypto');
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex');
    const passwordHash = `${salt}:${hash}`;

    // Create user
    const { data: user, error } = await admin
      .from('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase(),
        password_hash: passwordHash,
        is_admin: email.toLowerCase().startsWith('admin@'),
      })
      .select('id, name, email, is_admin, profile_completed, created_at')
      .single();

    if (error || !user) {
      console.error('Signup error — SUPABASE_SERVICE_ROLE_KEY may be missing or misconfigured:', error);
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support or try again in a moment.' },
        { status: 500 }
      );
    }

    // Sign a JWT token
    const token = signToken(user);

    // Set httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    });

    response.cookies.set('nsk_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    response.cookies.set('nsk_is_admin', String(user.is_admin), {
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

function signToken(user: any): string {
  // Simple JWT-like token for MVP (base64 encoded payload with HMAC)
  // In production, use jose or jsonwebtoken library
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.is_admin,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30),
  }));

  const secret = process.env.JWT_SECRET || 'beginly_jwt_secret_2026_change_me_in_production_abc123xyz';
  
  // Simple HMAC for MVP (use proper library in production)
  const crypto = require('crypto');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}
