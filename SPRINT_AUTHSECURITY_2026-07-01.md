# Beginly Auth Fix — 2026-07-01

## Goal
Fix broken Supabase browser auth (network blocked from browser) by completing the custom auth system end-to-end.

## What Was Done

### 1. Landing Page (`app/page.tsx`) — Fixed
- Replaced `createServerClient` + `supabase.auth.getUser()` with custom JWT cookie check using `jsonwebtoken/verify`
- No more Supabase server-side call on the landing page

### 2. `getSupabase()` / `supabase.ts` — Fixed
- Added 10-second `AbortController` timeout to all Supabase fetch calls
- Disabled `autoRefreshToken` and `persistSession` (we manage sessions via custom JWT)
- Data calls (`.from(...)`) now return after 10s instead of hanging indefinitely
- Auth calls (`supabase.auth.*`) are now dead code in browser (never called)

### 3. `app/settings/page.tsx` — Fixed
- `supabase.auth.getUser()` replaced with `/api/auth/me` call using `custom_auth_token` from localStorage
- `supabase.auth.signOut()` replaced with `/api/auth/logout` API call + `clearUser()`
- `supabase` instance renamed to `sb` for clarity (import still available for data calls)
- Added 8-second timeout wrapper around `/api/auth/me` fetch

### 4. `app/api/auth/me/route.ts` — Fixed (root cause)
- Session lookup changed from `.eq("token", token)` to `.eq("id", payload.sessionId)`
- Root cause: sign-in stores `crypto.randomUUID()` as the session token, not the JWT; `.single()` was failing with PGRST116 because multiple sessions existed for the same user — now we look up by the `sessionId` stored in the JWT
- Added proper session revocation check on logout

### 5. `AuthUser` interface (`lib/auth-context.tsx`) — Fixed
- Added `name?: string` and `email?: string` optional fields to `AuthUser`
- Fixes Navigation.tsx type error

### TypeScript Status
- **0 errors** — confirmed with `npx tsc --noEmit`

## Auth Flow (all passing)
```
Sign-in (POST /api/auth/signin)     → 200 ✓
Get user (GET /api/auth/me)         → 200 ✓
After logout (GET /api/auth/me)     → 401 ✓
Logout (POST /api/auth/logout)      → 200 ✓
Landing page (GET /)                → 200 ✓ (compiled, fast)
Login page (GET /login)             → 200 ✓
Dashboard unauthenticated           → 307/302 ✓ (Next.js 15 default)
```

## Remaining Issues
1. **v1.3.6 schema patch not applied** — `notification_preferences`, `user_notifications`, `safety_cases`, `user_milestones`, `opportunities`, `partner_leads`, `referral_disclosures`, `training_modules`, `scam_reports` tables/columns missing in Supabase
   - Requires manual SQL paste into Supabase SQL Editor
2. **Settings page reminder/delete** — still uses browser Supabase calls for `reminder_prefs` upsert and `support_tickets` delete, but with timeout they won't hang indefinitely
3. **`test-login/page.tsx`** — still has Supabase auth calls, needs fixing

## Key Files Modified
- `app/page.tsx` — custom JWT cookie check
- `lib/supabase.ts` — timeout + no auto-refresh
- `app/settings/page.tsx` — custom auth token + /api/auth/me
- `app/api/auth/me/route.ts` — sessionId lookup
- `lib/auth-context.tsx` — AuthUser fields added
