# Reset Password Flow

**Date:** 2026-08-13
**Branch:** `feat/reset-password-flow`
**Reason:** Beginly had no self-service way to recover a forgotten password. `app/login/page.tsx` and `app/signup/page.tsx` covered sign-in/sign-up but there was no `/forgot-password` or `/reset-password` route, and `supabase.auth.resetPasswordForEmail` / `updateUser` were unused anywhere in the codebase.

## Scope

Greenfield feature, kept intentionally to just the forgot/reset-password path — the two auth pages, the login page hookup, and the two emails that path needs. Email delivery for the reset link goes through Resend via a Supabase **Send Email Hook**, not Supabase's built-in mailer — see [AUTH_EMAIL_TEMPLATES.md](AUTH_EMAIL_TEMPLATES.md) for why and how that's wired.

## Flow

1. **Request** — `app/login/page.tsx` has a "Forgot password?" link next to the password field, pointing to `/forgot-password` (preserving any `?redirect=`/`?product=` intent already on the login URL).
2. **`app/forgot-password/page.tsx`** — user enters their email. Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo })`, where `redirectTo` points back to `/reset-password` (carrying the safe redirect intent forward as a query param so it survives the email round-trip). Always shows a generic "check your email" success card, whether or not the address has an account, to avoid leaking which emails are registered.
3. **Email** — Supabase Auth generates the recovery token and, instead of sending its own email, calls our Send Email Hook (`app/api/auth/send-email-hook/route.ts`), which sends a brand-matched email via Resend (`sendPasswordResetEmail()` in `lib/email.ts`) containing a link back to `redirectTo` with a PKCE `?code=...`. See [AUTH_EMAIL_TEMPLATES.md](AUTH_EMAIL_TEMPLATES.md) for the full mechanics.
4. **`app/reset-password/page.tsx`** — on load, checks the URL for an `error_description` (expired/invalid link) or a `code`/`type=recovery` param. If present, subscribes to `supabase.auth.onAuthStateChange` and waits for the `PASSWORD_RECOVERY` event (fired once Supabase's client exchanges the code for a session) before showing the new-password form. An 8s timeout guards against a link that never resolves.
5. On submit, calls `supabase.auth.updateUser({ password })`. On success, best-effort POSTs to `app/api/auth/password-changed/route.ts` (bearer-authenticated with the still-live recovery session's access token) to send a "your password was changed" security notice via `sendPasswordChangedEmail()`. Then signs the recovery session out and redirects to `/login?reset=true` (or `/login?redirect=...&reset=true` if a redirect intent was carried through).
6. **`app/login/page.tsx`** — reads `?reset=true` and shows a "Password updated" success banner, mirroring the existing `?confirmed=true` pattern from email confirmation.

## Files changed

| File | Change |
|---|---|
| [app/forgot-password/page.tsx](../app/forgot-password/page.tsx) | New — request-reset form + success state |
| [app/reset-password/page.tsx](../app/reset-password/page.tsx) | New — recovery-link handling + new-password form; POSTs to `/api/auth/password-changed` on success |
| [app/login/page.tsx](../app/login/page.tsx) | Added "Forgot password?" link and `?reset=true` success banner |
| [lib/navigation/post-auth.ts](../lib/navigation/post-auth.ts) | `withPostAuthIntent` now also accepts `/forgot-password` |
| [lib/email.ts](../lib/email.ts) | Added `sendPasswordResetEmail()`, `sendPasswordChangedEmail()`, `sendAuthActionEmail()` (fallback) — see [AUTH_EMAIL_TEMPLATES.md](AUTH_EMAIL_TEMPLATES.md) |
| [app/api/auth/send-email-hook/route.ts](../app/api/auth/send-email-hook/route.ts) | New — Supabase Send Email Hook receiver. Wrapped in a top-level try/catch with per-branch `console.error` logging, since Supabase only ever surfaces a generic "Error sending recovery email" to the client — the real cause is only visible in this route's server logs |
| [app/api/auth/password-changed/route.ts](../app/api/auth/password-changed/route.ts) | New — sends the post-reset security notice |
| [public/beginly-mark.svg](../public/beginly-mark.svg), [public/beginly-mark.png](../public/beginly-mark.png) | New — the Beginly mark, exported as static assets for use in email `<img>` tags (see [AUTH_EMAIL_TEMPLATES.md](AUTH_EMAIL_TEMPLATES.md)) |
| [vitest.config.ts](../vitest.config.ts) | Added `esbuild: { jsx: "automatic" }` — needed to render `.tsx` components in tests at all; no existing test previously rendered a React component |
| [__tests__/lib/post-auth.test.ts](../__tests__/lib/post-auth.test.ts) | New — unit tests for the redirect-safety helpers |
| [__tests__/app/forgot-password.test.tsx](../__tests__/app/forgot-password.test.tsx) | New — component tests |
| [__tests__/app/reset-password.test.tsx](../__tests__/app/reset-password.test.tsx) | New — component tests |
| [__tests__/lib/email.test.ts](../__tests__/lib/email.test.ts), [__tests__/api/send-email-hook.test.ts](../__tests__/api/send-email-hook.test.ts), [__tests__/api/password-changed.test.ts](../__tests__/api/password-changed.test.ts) | New — email content + API route tests |
| `package.json` / `package-lock.json` | Added `standardwebhooks` as a direct dependency (was already transitively pulled in by `resend`, but imported directly by the hook route) |
| [docs/AGENTS.md](AGENTS.md) | Documented the new `SEND_EMAIL_HOOK_SECRET` env var |

## Conventions followed

Matches existing `app/login` / `app/signup` pages: plain `useState` fields with manual validation (no form/schema library), the shared `.card`/`.input-field`/`.btn-primary` CSS classes, inline red/green alert `<div>`s with `lucide-react` icons, and a "check your email" success-card swap in place of navigation (same pattern as signup). `app/api/auth/password-changed/route.ts` follows the existing `requireApiActor`/`apiFailure` pattern from `lib/platform/api-auth.ts`.

## Manual follow-up (not in this repo)

- Add `{{ site_url }}/reset-password` (and any preview/staging origins) to Supabase Auth → URL Configuration → Redirect URLs.
- Configure the Send Email Hook in Supabase Auth → Hooks, pointing at `/api/auth/send-email-hook`, and set `SEND_EMAIL_HOOK_SECRET` — see [AUTH_EMAIL_TEMPLATES.md](AUTH_EMAIL_TEMPLATES.md) for the full setup and the operational caveat about it being an all-or-nothing switch for every auth email type.

## Testing

- `npx vitest run` — 125 tests passing across 14 files: post-auth unit tests, forgot/reset-password component tests (invalid/expired links, password validation, success + error paths, redirect-intent propagation, the best-effort password-changed notification and its failure path), the two new API routes, and the new `lib/email.ts` functions. See [AUTH_EMAIL_TEMPLATES.md](AUTH_EMAIL_TEMPLATES.md)'s Testing section for the email/route-specific breakdown.
- `npx tsc --noEmit` — clean.
- Manually verified end-to-end against a live Supabase project: local dev tunnelled via ngrok (Supabase Cloud can't reach `localhost` directly), Send Email Hook pointed at the tunnel URL. This surfaced two real issues since fixed — a `SEND_EMAIL_HOOK_SECRET` format mismatch (`v1,whsec_...` vs. the `whsec_...` the `standardwebhooks` library actually expects) and the SVG-in-Gmail logo rendering gap — both documented in [AUTH_EMAIL_TEMPLATES.md](AUTH_EMAIL_TEMPLATES.md).
