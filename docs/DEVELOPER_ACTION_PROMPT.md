# Beginly v1.2 — Stabilisation Developer Action Prompt

Use this prompt with a coding agent/developer to stabilise the current Beginly MVP. Beginly is the public-facing brand/domain evolved from the NewStart UK v1.2 architecture.

## Non-negotiable direction

1. Public brand is **Beginly**.
2. Supabase Auth is the single source of truth.
3. Email confirmation is ON and must be handled properly.
4. Do not trust client-created cookies or localStorage for authentication/admin access.
5. Document Helper is paste-text-only for MVP.
6. Generate user roadmap tasks after onboarding.
7. Persist user profile, task progress, reminder preferences, and support tickets in Supabase.
8. Keep Opportunity Scanner/referrals/packages/geo-notifications for a later controlled sprint after MVP stability.

## Priority fixes

- Verify signup → email confirmation → login → onboarding → dashboard.
- Verify sign out → sign in again with same credentials.
- Run `supabase/schema.sql`.
- Verify RLS policies with two test users.
- Run `npm run test` and `npm run build`.

## Acceptance gate

Beginly v1.2 is not ready until a fresh confirmed Supabase user can sign in, complete onboarding, receive generated tasks, mark tasks complete, submit support, save reminder preferences, sign out, and sign in again without losing state.
