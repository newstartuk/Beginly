# Beginly v1.2 Stabilisation Report

## Source used

- Input source: `Beginly-main (1).zip`
- Supabase project URL supplied: `https://cpzxtpwajxqbgyqtbbmx.supabase.co`
- Deployment target supplied: Vercel
- Email confirmation: ON
- Approved decisions: Supabase Auth as the single source of truth; Document Helper paste-text-only for MVP.

## Summary verdict

This pass addresses the most important structural issues behind the signup/signout/signin instability and the earlier QA diagnosis. The source has been moved away from the previous split-auth model and toward a Supabase Auth-led MVP foundation.

The project is significantly closer to a 10/10 MVP foundation, but one production build verification remains unresolved in this sandbox: `next build` compiles in some runs but consistently times out/hangs during the Next.js production build/page-data stage in the container. TypeScript and unit tests pass.

## Major corrections made

### 1. Supabase Auth is now the source of truth

- Removed unsafe reliance on custom `nsk_session` and `nsk_is_admin` cookies.
- Removed browser-created fake `HttpOnly` cookie logic.
- Added `lib/auth-client.ts` to hydrate the app user from Supabase Auth.
- Signup now respects email confirmation being ON.
- Login now handles confirmed email/session state and redirects according to profile completion.
- Logout no longer depends on stale localStorage auth authority.

### 2. Email-confirmation flow corrected

Because Supabase email confirmation is ON, signup no longer pretends the user is fully logged in immediately. The signup page now shows a check-email flow when Supabase does not return an active session.

### 3. Onboarding now generates user roadmap tasks

- Added `lib/task-generator.ts`.
- Onboarding now saves the arrival profile and inserts generated `user_tasks`.
- Checklist now repairs missing task rows if a profile exists but no roadmap tasks were generated.
- Dashboard readiness calculation now uses the personalised task set rather than all seed tasks.

### 4. Checklist persistence improved

- Checklist status updates now persist to Supabase `user_tasks`.
- Task detail pages now read and update the logged-in user's task status from Supabase.

### 5. Support form made operational

- Support tickets now insert into a Supabase `support_tickets` table.
- The previous localStorage-only ticket pattern has been removed from the support flow.

### 6. Document Helper corrected for MVP boundary

- Removed misleading PDF/image upload flow.
- Document Helper is now paste-text-only for non-sensitive excerpts.
- The UI now warns users not to paste passports, visa records, bank letters, tenancy contracts, or medical documents.

### 7. Nia guardrails tightened

- Removed bank/product ranking style wording.
- Removed over-strong health entitlement language.
- Added safer responses for immigration, work-rights, housing, council tax, banking, medical, and document topics.
- Nia now frames responses as general guidance and signposting.

### 8. Tailwind/design tokens corrected

- `tailwind.config.ts` now maps Beginly colours and tokens properly.
- Removed the misleading earlier assumption that a separate `tailwind.config.js` contained the real theme.

### 9. Supabase schema updated

- Rewrote `supabase/schema.sql` for the stabilised MVP foundation.
- Added/updated tables for users, arrival profiles, user tasks, reminder preferences, and support tickets.
- Added safer RLS patterns for user-owned rows.
- Aligned task status values with frontend expectations: `not_started`, `in_progress`, `complete`.

### 10. Beginly rebrand cleanup

- Active user-facing code now uses Beginly naming.
- `newstartuk.app` and `noreply@newstartuk.app` references were removed.
- Storage keys were migrated from `nsk_*` to `beginly_*`.
- Remaining NewStart mentions are lineage/context references only.

### 11. Documentation updated

- README rewritten to match the actual Supabase Auth architecture.
- `.env.local.example` updated for Beginly/Vercel/Supabase.
- Developer action prompt updated for Beginly stabilisation.

## QA results

### Passed

```bash
npm ci --ignore-scripts
npm test -- --run
./node_modules/.bin/tsc --noEmit --pretty false
```

Result:

- Unit tests: 3 files passed, 26 tests passed.
- TypeScript check: passed.

### Not fully cleared in this sandbox

```bash
next build
```

Observed result:

- The build reaches the Next.js production build process.
- In sandbox runs, it either times out while compiling or times out/hangs at `Collecting page data ...`.
- No TypeScript errors remain; standalone `tsc --noEmit` passes.

Recommended next verification:

Run the production build on the developer machine or Vercel after Supabase environment variables are configured and after the schema has been applied.

## Supabase setup required before live testing

1. Open Supabase SQL Editor.
2. Run `supabase/schema.sql` from this corrected source.
3. Confirm the following tables exist:
   - `users`
   - `arrival_profiles`
   - `user_tasks`
   - `reminder_prefs`
   - `support_tickets`
4. In Supabase Auth settings, set:
   - Site URL: `https://beginly.app`
   - Redirect URLs:
     - `https://beginly.app/login?confirmed=true`
     - `https://beginly.app/**`
     - any Vercel preview URLs used for testing
     - `http://localhost:3000/**` or your local development port if needed
5. Confirm email confirmation remains ON.

## Vercel environment variables required

```env
NEXT_PUBLIC_SUPABASE_URL=https://cpzxtpwajxqbgyqtbbmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://beginly.app
FROM_EMAIL=noreply@beginly.app
```

Do not expose service-role keys to client-side code.

## Manual QA script after deployment

1. Visit `https://beginly.app/signup`.
2. Register with a fresh email address.
3. Confirm that the page tells the user to check email.
4. Confirm the email in Supabase/email inbox.
5. Login with the same credentials.
6. Complete onboarding.
7. Confirm dashboard opens.
8. Confirm checklist has generated roadmap tasks.
9. Mark a task complete.
10. Sign out.
11. Sign in again with the same credentials.
12. Confirm profile, dashboard and task status persist.
13. Open Document Helper and confirm it is paste-text-only.
14. Submit a support ticket and confirm it appears in Supabase.
15. Confirm admin routes do not appear for normal users.

## Remaining recommendations before calling final 10/10

- Replace client-only admin guard with server-side Supabase SSR role enforcement when `@supabase/ssr` is introduced.
- Add production-grade email reminders through Resend.
- Add a true admin console for content/task/support ticket management.
- Add source-review dates to guidance content.
- Add Opportunity Registry later, after core auth/profile/task flow is stable.
- Investigate the Next production build timeout on Vercel/local development and update the Next config accordingly.
