# Beginly

**Your guided start in the UK.**

Beginly helps newcomers — starting with international students — organise their first 90 days in the UK through a personalised checklist, plain-English guidance, scam/mistake warnings, reminders, and a readiness score.

> Beginly provides general settlement guidance and checklist support. It does **not** provide legal, immigration, financial, tax, medical, or housing advice.

---

## Current status

This codebase carries the **Beginly v1.3 platform baseline**, merged in on
top of the rebranded v1.2 checklist product. See `ROADMAP.md` for the full
phased implementation plan — in short: the brand identity, landing page and
platform code (web + mobile) are in place; Supabase schema reconciliation
for the new platform tables is the next blocking step before the merged
pages are functional beyond their static shell.

The public brand is **Beginly**. The original strategy lineage was **NewStart UK v1.2**, but user-facing code, documentation, email/domain references, and storage keys should now use Beginly.

---

## Key fixes in this build

- Supabase Auth is the single source of truth for signup, sign-in, sign-out, and sessions.
- Email confirmation is supported: signup shows a check-your-email flow instead of forcing onboarding before confirmation.
- The old `nsk_session` / `nsk_is_admin` middleware authority has been removed.
- Onboarding saves the arrival profile to Supabase and generates user roadmap tasks.
- Checklist and task detail pages persist progress to Supabase `user_tasks`.
- Support tickets persist to Supabase `support_tickets`.
- Document Helper is MVP-safe and paste-text-only.
- Tailwind design tokens are mapped in `tailwind.config.ts`.
- Beginly environment variables and domain references are updated.

---

## Tech stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Framer Motion
- Supabase Auth + Postgres (`@supabase/supabase-js`, `@supabase/ssr`)
- Stripe (billing), Resend (transactional email)
- Expo / React Native (`mobile/` — separate project, own `package.json`)
- Vercel deployment

---

## Environment variables

Create `.env.local` for local development and mirror these values in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cpzxtpwajxqbgyqtbbmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://beginly.app
FROM_EMAIL=noreply@beginly.app
```

Do **not** expose the service-role key in the browser. Use it only for future server-side admin/account-deletion flows.

---

## Supabase setup

Run `supabase/schema.sql` in the Supabase SQL Editor. The schema creates/updates:

- `users`
- `arrival_profiles`
- `user_tasks`
- `reminder_prefs`
- `support_tickets`

The schema includes Row Level Security policies so users can access only their own rows.

### Auth settings to check

In Supabase Auth settings:

- Site URL: `https://beginly.app`
- Redirect URLs should include:
  - `https://beginly.app/**`
  - your Vercel preview URL(s)
  - `http://localhost:3456/**`

Email confirmation may remain ON. The app now handles that flow.

---

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3456`.

## QA commands

```bash
npm run test
npm run build
```

`npm run lint` may need updating because Next.js 15 no longer supports the old `next lint` flow in some setups. Use ESLint directly if required.

---

## MVP boundaries

Document Helper is paste-text-only. Do not enable PDF/image upload until extraction, retention, privacy, and safety controls are implemented.

Opportunity Scanner, referrals, package prompts, push notifications, and geo/radius-sensitive alerts should be built after core auth/profile/task stability is verified.

---

Built with care for everyone starting in the UK.
