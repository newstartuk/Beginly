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

To avoid silently breaking those other flows the moment this hook is turned on, `app/api/auth/send-email-hook/route.ts` handles `email_action_type === "recovery"` and `"signup"` with their own dedicated templates, and falls back to a generic-but-branded `sendAuthActionEmail()` for the rest (magiclink, invite, email_change, reauthentication). Those fallback emails are functional but not custom-designed. If/when one of them gets its own polished template, add it to `AUTH_ACTION_COPY` in `lib/email.ts` or give it a dedicated `send*Email()` function and branch to it in the route — same pattern `sendSignupConfirmationEmail()` follows.

## The emails

Every email `lib/email.ts` sends now shares one visual template — this started as just the two forgot-password emails, but was later extended to cover the whole file:

| Email | Trigger | Function |
|---|---|---|
| Welcome | `app/api/webhooks/resend/route.ts`, on a Database Webhook firing when `auth.users.confirmed_at` transitions to set | `sendWelcomeEmail()` |
| Reset password (the link) | Supabase Send Email Hook, `email_action_type === "recovery"` | `sendPasswordResetEmail()` |
| Password changed (security notice) | `app/reset-password/page.tsx`, right after `supabase.auth.updateUser()` succeeds | `sendPasswordChangedEmail()`, via [app/api/auth/password-changed/route.ts](../app/api/auth/password-changed/route.ts) |
| Signup confirmation | Supabase Send Email Hook, `email_action_type === "signup"` | `sendSignupConfirmationEmail()` — added 2026-09-01, previously routed through the generic fallback below |
| Generic auth-action fallback (magiclink, invite, email_change, reauthentication) | Supabase Send Email Hook, any other `email_action_type` | `sendAuthActionEmail()` |
| Task reminder (daily/weekly/biweekly/monthly) | Vercel Cron, `GET /api/cron/task-reminders` — see [TASK_REMINDER_EMAILS.md](TASK_REMINDER_EMAILS.md) | `sendTaskReminderEmail()` |

All six (all in [lib/email.ts](../lib/email.ts)) share: a cream page background (`#EAF8F7`), a white card with a `#DCE9EA` border and `18px` radius, navy body text (`#0D223D`), Georgia-serif headings, a coral (`#FF6B57`) CTA button, a tan security/callout box, a footer sign-off ("Beginly" / "Open what comes next.", above the "reason" line and the copyright/Privacy/Terms line), and a three-colour brand stripe (`#18B7B5` / `#FF6B57` / `#F2B544`) along the bottom edge. Each also sets a plain-text `text:` body alongside `html:` in the Resend call. Table-based markup (`<table role="presentation">`) rather than `<div>`s, for better rendering in Outlook's Word engine.

None of them set an HTML `<title>` tag — an earlier revision did, and some email clients (notably Outlook.com and other webmail renderers) don't hide `<title>` content properly, rendering it as a visible line at the very top of the message body, before the actual header. Since `<title>` was set to the same string as the `subject:` field, this showed up as literally the same text appearing twice — once as the subject, once as the first visible line in the body. The `subject:` field alone controls what an inbox shows; `<title>` serves no purpose in email and was removed from the templates that had it (`sendSignupConfirmationEmail()`, added later, never had one to begin with).

The header shows the actual Beginly mark (see "Logo asset" below) next to hand-coded "Beginly" / "Open what comes next." text — not the wordmark as a single image.

The "password changed" email has no action link to the reset flow itself (it's a notice, not an action), just a "Sign in →" CTA and a "Wasn't you?" callout linking to `/forgot-password`. None of the six currently show a raw fallback URL as visible text in their HTML (an early revision of `sendAuthActionEmail()` did, but that block had been accidentally written with `//`-style line comments — invalid inside an HTML string, so it would have rendered as literal visible garbage text in the sent email; it was removed rather than fixed, since the CTA button already covers the same need). The actual links are still present in every email's plain-text `text:` alternative body.

## Shared layout helpers & HTML escaping

`lib/email.ts` has a small set of shared builder functions at the top of the file — `emailHeader()`, `emailDivider()`, `emailFooter()`, `brandStripe()`, `ctaButton()`, `securityBox()` — each returning a string of `<tr>`/`<table>` markup for the shared cream/navy/coral design. All five email functions are built from these (in earlier revisions, `sendPasswordResetEmail()`, `sendWelcomeEmail()`, and `sendTaskReminderEmail()` each had their own fully-inlined markup instead — all three were folded into the shared helpers, so every email now stays in sync automatically if the shared look changes). `emailFooter()` takes an optional `reason` string (e.g. "You received this email because you created a Beginly account.") since a single hardcoded "authentication action" line didn't make sense for a welcome or task-reminder email.

There's also a new `escapeHtml()` helper, applied to dynamic values interpolated into HTML bodies (`name`, `email`, action/reset URLs) to prevent HTML injection — e.g. a Supabase `user_metadata.name` containing markup can't break out of the template. It's deliberately *not* applied inside any `text:` (plain-text) body, since HTML-escaping plain text would show literal `&amp;`-style artifacts instead of the intended characters.

## Logo asset

The header `<img>` in all three needs an absolute, publicly-hosted URL — email HTML has no build pipeline, so `components/Logo.tsx` (a React component) and relative paths don't work. The mark (not the full lockup — the wordmark text is already hand-coded separately next to it) is exported as static files:

- [public/beginly-mark.svg](../public/beginly-mark.svg) — geometry copied from `Logo.tsx`'s `variant="mark"` output, with `useId()`'s dynamic gradient/filter ids replaced by static ones (`beginlyMarkBeam`, `beginlyMarkGlow`).
- [public/beginly-mark.png](../public/beginly-mark.png) — a 240×245 rasterization of the same SVG, generated with `sharp` (already present in `node_modules` transitively, not added as a project dependency since nothing imports it — it was only run once as a one-off `node -e` script, not checked in as a build step).

**Client support caveat:** SVG in `<img src>` is inconsistently supported — Apple Mail and Chromium-based clients (new Outlook, Outlook on the web) render it fine, but Gmail (web and app) does not render SVG images at all, and classic Outlook desktop (Word engine) doesn't either. The logo `src` is a single `LOGO_SRC` constant near the top of `lib/email.ts` (`` `${DEFAULT_SITE_URL}/beginly-mark.png` ``), read once by `emailHeader()` and reused by all six emails — currently pointed at the PNG. Swapping to the SVG (or back) only means changing that one constant, not separate `<img>` tags per email.

## Why "password changed" can't use the hook

Supabase's Send Email Hook only fires for its own auth email types (signup, invite, magiclink, recovery, email_change, reauthentication) — there's no "password successfully changed" event. So that one is triggered directly by our own code: `app/reset-password/page.tsx` POSTs to `/api/auth/password-changed` with the recovery session's access token in the `Authorization` header immediately after `updateUser()` succeeds; the route verifies that token via the existing `requireApiActor()` helper (`lib/platform/api-auth.ts`) before sending, so it can't be used to spam arbitrary addresses.

## Building the action link

`app/api/auth/send-email-hook/route.ts` builds the verify URL (`${supabaseUrl}/auth/v1/verify?token=...&type=...&redirect_to=...`) with `URL`/`URLSearchParams` rather than raw string concatenation, so `token_hash` and `redirect_to` are properly URL-encoded.

The route also validates the hook's `redirect_to` against an allowlist of trusted origins before using it — the allowed origin is derived from `NEXT_PUBLIC_SITE_URL` itself (not a second hardcoded copy of it, to avoid the two drifting apart) plus `http://localhost:3456` for local dev. **Fixed on 2026-09-01** — this allowlist was originally computed (`safeRedirectTo`) but never actually applied; the verify URL was still built from the raw, unvalidated `emailData.redirect_to` regardless of whether it passed validation, making the check dead code. Now `safeRedirectTo` (empty string if the value was untrusted or malformed) is what actually goes into the verify URL. An empty `redirect_to` makes Supabase fall back to its own configured Site URL, which is the correct fail-safe outcome for an open-redirect guard — never forward somewhere unvetted. See [__tests__/api/send-email-hook.test.ts](../__tests__/api/send-email-hook.test.ts) for the untrusted/localhost/malformed cases now covered.

## The welcome email's actual trigger

Unlike the Send Email Hook (an Auth Hook), the welcome email is triggered by a separate, pre-existing **Database Webhook** on the `auth.users` table, configured independently in Supabase Dashboard → Database → Webhooks, pointed at `app/api/webhooks/resend/route.ts`. That route watches for `confirmed_at` transitioning from null to set, then calls `sendWelcomeEmail()`.

This route pre-dates the forgot-password work but had a real, previously-undiscovered bug: it wrote to `webhook_events` columns (`payload_fingerprint`, `status`, `event_type`, `error_code`) that don't exist on the table — the actual schema (`supabase/migrations/00000000000000_baseline_snapshot.sql`) has `payload_hash` and `state` (CHECK-constrained to `'received' | 'processed' | 'failed'`), and no `event_type`/`error_code` columns at all. Every ledger insert failed with a genuine Postgres error, silently blocking the welcome email — silently, because the route also had zero logging anywhere. Both are now fixed: the insert/update calls use the real column names and allowed `state` values, and every failure branch (missing `BEGINLY_WEBHOOK_SECRET`, bad bearer token, missing Supabase env vars, ledger insert failure, `sendWelcomeEmail` failure) now logs via `console.error`.

Separately, the route originally required an `x-beginly-event-id` or `x-supabase-event-id` header to dedupe deliveries — but Supabase's native Database Webhooks don't send either automatically (that's a no-code dashboard feature, not a custom `pg_net` trigger you write yourself), so this always evaluated to nothing and 400'd every single delivery. Fixed by using a content hash of the payload (already computed for the `payload_hash` audit column) as the idempotency key directly — a real confirmation event is naturally unique on its own (distinct user id + `confirmed_at` timestamp), so no header was ever needed.

## Setup (Supabase dashboard)

1. **Authentication → Hooks → Send Email hook** → enable, point it at `https://<your-domain>/api/auth/send-email-hook`, and copy the signing secret it generates.
2. Supabase shows the secret as `v1,whsec_XXXX...` — set `SEND_EMAIL_HOOK_SECRET` to only the `whsec_XXXX...` part (drop the leading `v1,`). The installed `standardwebhooks@1.0.0` only strips its own `whsec_` prefix (`Webhook.prefix = "whsec_"` in `node_modules/standardwebhooks/dist/index.js`) — it does **not** strip `v1,`. Pasting the full `v1,whsec_...` string verbatim fails with `Base64Coder: incorrect characters for decoding`, since the comma isn't valid base64.
3. Confirm `RESEND_API_KEY` and `NEXT_PUBLIC_SUPABASE_URL` are set (both already required elsewhere in the app).
4. Add `{{ site_url }}/reset-password` to Authentication → URL Configuration → Redirect URLs (see [RESET_PASSWORD_FLOW.md](RESET_PASSWORD_FLOW.md)).

No dashboard email template editing is needed — once the hook is enabled, Supabase's own template content is bypassed entirely for the types this route handles.

## Testing

- [__tests__/lib/email.test.ts](../__tests__/lib/email.test.ts) — `sendPasswordResetEmail()`, `sendPasswordChangedEmail()`, `sendSignupConfirmationEmail()`, `sendAuthActionEmail()` (Resend mocked).
- [__tests__/api/send-email-hook.test.ts](../__tests__/api/send-email-hook.test.ts) — signature verification, missing-field handling, recovery vs. signup vs. fallback branching, verify-URL construction, `redirect_to` allowlist enforcement (`standardwebhooks` mocked).
- [__tests__/api/password-changed.test.ts](../__tests__/api/password-changed.test.ts) — demo-actor short-circuit, auth failure delegation, send failure → 502.
- Manually exercised end-to-end against a live Supabase project (local dev tunnelled via ngrok, hook pointed at the tunnel URL) — this is how the `v1,whsec_` secret-format issue above and the SVG-in-Gmail rendering gap (see "Client support caveat" above) were actually found.

## Not done

- `sendTaskReminderEmail()` is now triggered by a real Vercel Cron job (`app/api/cron/task-reminders/route.ts`) — see [TASK_REMINDER_EMAILS.md](TASK_REMINDER_EMAILS.md) for that flow, its kill switch, and its own "Not done" list.
- The `email_change` fallback only links the primary `token_hash` — Supabase actually issues two tokens for an email change (old + new address); the new-address confirmation isn't separately handled. Not a concern for this branch's scope (forgot password), but worth knowing if email-change ever gets its own dedicated template.
- `public/beginly-mark.svg` is currently unused (`LOGO_SRC` points at the PNG) — left in place rather than deleted, since it's a one-line swap back if SVG client support ever becomes viable.
