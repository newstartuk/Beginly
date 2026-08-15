# Auth Email Templates — Forgot/Reset Password

**Date:** 2026-08-13
**Reason:** The forgot-password flow needs two emails — the reset link itself, and a security notice once the password actually changes. Both are sent through Resend (matching the existing `sendWelcomeEmail()` pattern in `lib/email.ts`) instead of Supabase's built-in mailer, via a Supabase **Send Email Hook**.

## Why a Send Email Hook

`supabase.auth.resetPasswordForEmail()` doesn't send email itself — by default, Supabase Auth (GoTrue) generates the recovery token and sends the email using whatever's configured in the dashboard's Email Templates / SMTP settings. A **Send Email Hook** replaces that: Supabase instead calls an HTTP endpoint of ours with the token and user data, and we take over sending — in this case through Resend, using the same visual template family as `sendWelcomeEmail()`.

```
Your Next.js app
   ↓
supabase.auth.resetPasswordForEmail(...)
   ↓
Supabase Auth creates the secure recovery token
   ↓
Supabase Send Email Hook  →  POST /api/auth/send-email-hook
   ↓
Route verifies the webhook signature, builds the action link,
calls sendPasswordResetEmail() (lib/email.ts)
   ↓
sendPasswordResetEmail() calls the Resend API
   ↓
User gets our branded email
```

## ⚠️ Important operational caveat

**The Send Email Hook is all-or-nothing.** Once enabled in the dashboard, Supabase routes *every* auth email through it — signup confirmation, magic link, invite, email change, reauthentication, not just password recovery. There's no per-type toggle on Supabase's side.

To avoid silently breaking those other flows the moment this hook is turned on, `app/api/auth/send-email-hook/route.ts` handles `email_action_type === "recovery"` with the dedicated template, and falls back to a generic-but-branded `sendAuthActionEmail()` for everything else (signup, magiclink, invite, email_change, reauthentication). Those fallback emails are functional but not custom-designed — only the two this branch cares about (reset link, password-changed) got a dedicated pass. If/when another flow (e.g. registration) gets its own polished template, add it to `AUTH_ACTION_COPY` in `lib/email.ts` or give it a dedicated `send*Email()` function and branch to it in the route.

## The two emails (plus the fallback)

| Email | Trigger | Function |
|---|---|---|
| Reset password (the link) | Supabase Send Email Hook, `email_action_type === "recovery"` | `sendPasswordResetEmail()` in [lib/email.ts](../lib/email.ts) |
| Password changed (security notice) | `app/reset-password/page.tsx`, right after `supabase.auth.updateUser()` succeeds | `sendPasswordChangedEmail()` in [lib/email.ts](../lib/email.ts), via [app/api/auth/password-changed/route.ts](../app/api/auth/password-changed/route.ts) |
| Generic fallback (signup, magiclink, invite, email_change, reauthentication) | Supabase Send Email Hook, any non-recovery `email_action_type` | `sendAuthActionEmail()` in [lib/email.ts](../lib/email.ts) |

These three now share their own table-based visual system, separate from `sendWelcomeEmail()`'s original gradient-header design (which is unchanged): a cream page background (`#EAF8F7`), a white card with a `#DCE9EA` border and `18px` radius, navy body text (`#0D223D`), Georgia-serif headings, a coral (`#FF6B57`) CTA button, a tan security-notice callout box, and a three-colour brand stripe (`#18B7B5` / `#FF6B57` / `#F2B544`) along the bottom edge. Each also sets a plain-text `text:` body alongside `html:` in the Resend call (not just `html:`, unlike `sendWelcomeEmail`/`sendTaskReminderEmail`). Table-based markup (`<table role="presentation">`) rather than `<div>`s, for better rendering in Outlook's Word engine.

The header shows the actual Beginly mark (see "Logo asset" below) next to hand-coded "Beginly" / "Open what comes next." text — not the wordmark as a single image.

The "password changed" email has no action link to the reset flow itself (it's a notice, not an action), just a "Sign in →" CTA and a "Wasn't you?" callout linking to `/forgot-password`.

**HTML fallback links differ between the two, worth knowing if you're editing either:** `sendAuthActionEmail()` still shows the raw action URL as visible, clickable text below the CTA button (for clients that strip button styling). `sendPasswordResetEmail()` doesn't — it replaced that with an expiry notice instead ("This password reset link will expire in 24 hours... click here to request a new one," linking to `/forgot-password`, not the reset link itself). Both still include the actual link in their plain-text `text:` alternative body regardless.

## Shared layout helpers & HTML escaping

`lib/email.ts` now has a small set of shared builder functions at the top of the file — `emailHeader()`, `emailDivider()`, `emailFooter()`, `brandStripe()`, `ctaButton()`, `securityBox()` — each returning a string of `<tr>`/`<table>` markup for the shared cream/navy/coral design. All three of `sendPasswordResetEmail()`, `sendPasswordChangedEmail()`, and `sendAuthActionEmail()` are now built from these (in an earlier revision, `sendPasswordResetEmail()` had its own fully-inlined markup instead — that's been folded into the shared helpers too, so all three stay in sync automatically if the shared look changes).

There's also a new `escapeHtml()` helper, applied to dynamic values interpolated into HTML bodies (`name`, `email`, action/reset URLs) to prevent HTML injection — e.g. a Supabase `user_metadata.name` containing markup can't break out of the template. It's deliberately *not* applied inside any `text:` (plain-text) body, since HTML-escaping plain text would show literal `&amp;`-style artifacts instead of the intended characters.

## Logo asset

The header `<img>` in all three needs an absolute, publicly-hosted URL — email HTML has no build pipeline, so `components/Logo.tsx` (a React component) and relative paths don't work. The mark (not the full lockup — the wordmark text is already hand-coded separately next to it) is exported as static files:

- [public/beginly-mark.svg](../public/beginly-mark.svg) — geometry copied from `Logo.tsx`'s `variant="mark"` output, with `useId()`'s dynamic gradient/filter ids replaced by static ones (`beginlyMarkBeam`, `beginlyMarkGlow`).
- [public/beginly-mark.png](../public/beginly-mark.png) — a 240×245 rasterization of the same SVG, generated with `sharp` (already present in `node_modules` transitively, not added as a project dependency since nothing imports it — it was only run once as a one-off `node -e` script, not checked in as a build step).

**Client support caveat:** SVG in `<img src>` is inconsistently supported — Apple Mail and Chromium-based clients (new Outlook, Outlook on the web) render it fine, but Gmail (web and app) does not render SVG images at all, and classic Outlook desktop (Word engine) doesn't either. The logo `src` is now a single `LOGO_SRC` constant near the top of `lib/email.ts` (`` `${DEFAULT_SITE_URL}/beginly-mark.png` ``), read once by `emailHeader()` and reused by all three emails — currently pointed at the PNG. Swapping to the SVG (or back) only means changing that one constant, not three separate `<img>` tags.

## Why "password changed" can't use the hook

Supabase's Send Email Hook only fires for its own auth email types (signup, invite, magiclink, recovery, email_change, reauthentication) — there's no "password successfully changed" event. So that one is triggered directly by our own code: `app/reset-password/page.tsx` POSTs to `/api/auth/password-changed` with the recovery session's access token in the `Authorization` header immediately after `updateUser()` succeeds; the route verifies that token via the existing `requireApiActor()` helper (`lib/platform/api-auth.ts`) before sending, so it can't be used to spam arbitrary addresses.

## Building the action link

`app/api/auth/send-email-hook/route.ts` builds the verify URL (`${supabaseUrl}/auth/v1/verify?token=...&type=...&redirect_to=...`) with `URL`/`URLSearchParams` rather than raw string concatenation, so `token_hash` and `redirect_to` are properly URL-encoded.

The route also computes a `safeRedirectTo` by validating the hook's `redirect_to` against an allowlist of trusted origins (`https://beginly.app`, `http://localhost:3456`), logging a warning for anything else. **This check doesn't currently do anything** — the actual verify URL is still built from the raw, unvalidated `emailData.redirect_to`, not `safeRedirectTo`. Worth fixing before relying on it as a real guard against an untrusted `redirect_to`.

## Setup (Supabase dashboard)

1. **Authentication → Hooks → Send Email hook** → enable, point it at `https://<your-domain>/api/auth/send-email-hook`, and copy the signing secret it generates.
2. Supabase shows the secret as `v1,whsec_XXXX...` — set `SEND_EMAIL_HOOK_SECRET` to only the `whsec_XXXX...` part (drop the leading `v1,`). The installed `standardwebhooks@1.0.0` only strips its own `whsec_` prefix (`Webhook.prefix = "whsec_"` in `node_modules/standardwebhooks/dist/index.js`) — it does **not** strip `v1,`. Pasting the full `v1,whsec_...` string verbatim fails with `Base64Coder: incorrect characters for decoding`, since the comma isn't valid base64.
3. Confirm `RESEND_API_KEY` and `NEXT_PUBLIC_SUPABASE_URL` are set (both already required elsewhere in the app).
4. Add `{{ site_url }}/reset-password` to Authentication → URL Configuration → Redirect URLs (see [RESET_PASSWORD_FLOW.md](RESET_PASSWORD_FLOW.md)).

No dashboard email template editing is needed — once the hook is enabled, Supabase's own template content is bypassed entirely for the types this route handles.

## Testing

- [__tests__/lib/email.test.ts](../__tests__/lib/email.test.ts) — `sendPasswordResetEmail()`, `sendPasswordChangedEmail()`, `sendAuthActionEmail()` (Resend mocked).
- [__tests__/api/send-email-hook.test.ts](../__tests__/api/send-email-hook.test.ts) — signature verification, missing-field handling, recovery vs. fallback branching, verify-URL construction (`standardwebhooks` mocked).
- [__tests__/api/password-changed.test.ts](../__tests__/api/password-changed.test.ts) — demo-actor short-circuit, auth failure delegation, send failure → 502.
- Manually exercised end-to-end against a live Supabase project (local dev tunnelled via ngrok, hook pointed at the tunnel URL) — this is how the `v1,whsec_` secret-format issue above and the SVG-in-Gmail rendering gap (see "Client support caveat" above) were actually found.

## Not done

- `sendTaskReminderEmail()` in `lib/email.ts` is untouched and still on the original gradient palette — it now visually diverges from the three password/auth-action emails' newer table-based design.
- The `email_change` fallback only links the primary `token_hash` — Supabase actually issues two tokens for an email change (old + new address); the new-address confirmation isn't separately handled. Not a concern for this branch's scope (forgot password), but worth knowing if email-change ever gets its own dedicated template.
- `public/beginly-mark.svg` is currently unused (`LOGO_SRC` points at the PNG) — left in place rather than deleted, since it's a one-line swap back if SVG client support ever becomes viable.
- The `redirect_to` allowlist in `app/api/auth/send-email-hook/route.ts` is computed but not applied (see "Building the action link" above) — the raw value is used regardless of whether it passed validation.
