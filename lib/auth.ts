/**
 * Deprecated custom JWT helper.
 *
 * Beginly v1.2 uses Supabase Auth as the single source of truth. Do not use
 * custom cookies such as `nsk_session` or client-generated admin flags for
 * route protection. Use `supabase.auth.getUser()` on the client and, in a future
 * server-side sprint, `@supabase/ssr` for middleware/server route protection.
 */

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export function verifyToken(_token: string): TokenPayload | null {
  console.warn("verifyToken is deprecated. Use Supabase Auth instead.");
  return null;
}

export function getUserIdFromRequest(_request: Request): string | null {
  console.warn("getUserIdFromRequest is deprecated. Use Supabase Auth instead.");
  return null;
}
