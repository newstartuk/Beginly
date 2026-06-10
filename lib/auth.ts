// JWT token verification for API routes and middleware
// Simple implementation for MVP — upgrade to jose/jsonwebtoken in production

const secret = process.env.JWT_SECRET || 'beginly_jwt_secret_2026_change_me_in_production_abc123xyz';

export interface TokenPayload {
  sub: string;       // user ID
  email: string;
  name: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Verify signature
    const crypto = require('crypto');
    const [header, payload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    // Decode and validate payload
    const decoded = JSON.parse(atob(payload));
    
    // Check expiration
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }

    return decoded as TokenPayload;
  } catch {
    return null;
  }
}

// Helper to extract user ID from request (for middleware/API routes)
export function getUserIdFromRequest(request: Request): string | null {
  // Try cookie first, then Authorization header
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => c.trim().split('='))
  );
  
  const token = cookies['nsk_session'];
  if (!token) return null;

  const payload = verifyToken(token);
  return payload?.sub || null;
}
