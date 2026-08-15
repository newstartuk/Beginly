# Beginly — agent context

Read this first. It's the dense, text-only equivalent of four visual
references published this session (roadmap, web architecture, design
system, mobile architecture) — written so an agent or a developer with zero
prior context can get oriented from this file alone, without needing the
rendered artifacts.

## What this project is

Beginly is a Next.js web app (+ a separate Expo/React Native mobile app)
that helps newcomers organise their first 90 days in the UK: a personalised
checklist, plain-English guidance, scam warnings, and a readiness score. Not
a legal/immigration/financial advice service — signposting only.

## The one fact that explains everything else

**This codebase is two products merged into one repository, not fully
unified.**

1. **Checklist era** (original, rebranded this session) — the simple
   settlement-checklist product. 16 pages under `components/Navigation.tsx`
   (sidebar shell): dashboard, checklist, tasks/[id], budget, guides,
   settings, support, bank, emergency, nhs, document-helper, plus
   `admin`, `admin/guides`, `admin/tasks`.
2. **Platform era** (merged from an external `v1.3` archive this session) —
   a much larger "adaptive transition OS" product: journey, household,
   opportunities, products/commerce, partners/commission, admin
   operations/observability, a policy-governed Nia. 17 pages under
   `components/platform/PlatformShell.tsx`.

They currently **coexist without being reconciled**. Do not assume a page
uses a particular shell, palette, or auth pattern — check which era it
belongs to first. `admin` is split across both shells today (`admin`,
`admin/guides`, `admin/tasks` use `Navigation.tsx`; `admin/operations`,
`admin/observability` use `PlatformShell`) — this is a known inconsistency,
not a bug you introduced.

Fully public pages (`/`, `/login`, `/signup`) use neither shell — they
hand-roll their own header markup.

## Directory map

```
app/
  admin/                    split across both shells — see above
  dashboard/ checklist/     checklist-era, Navigation.tsx
  tasks/ budget/ guides/ …
  journey/ household/       platform-era, PlatformShell.tsx
  opportunities/ products/ …
  api/platform/*            ~54 new API routes, platform-era
  api/admin/* api/webhooks/*
  page.tsx login/ signup/   rebranded this session, canonical brand
  _components/LandingPageClient.tsx   DEAD — nothing imports it, safe to delete
components/
  Logo.tsx                  Stepping Stones mark — ours, canonical
  RoadmapPreviewCard.tsx     self-playing hero card — ours
  Navigation.tsx             sidebar shell — checklist-era
  Navbar.tsx                 DEAD — nothing imports it
  platform/                  PlatformShell + platform-era components
lib/
  supabase.ts utils.ts auth-client.ts   ours, checklist-era (11 files)
  platform/ navigation/ providers/ email.ts …   merged, platform-era (59 files)
mobile/
  Separate Expo/RN app, own package.json, own tsconfig.json.
  Never installed or run — its own README says so.
  Talks to the SAME Next.js API routes as web (EXPO_PUBLIC_BEGINLY_API_URL,
  defaults to http://localhost:3456). Inherits the same schema gap as web.
supabase/
  schema.sql — the ONLY schema file. 5 tables. See gap below.
```

## The current blocking problem

`supabase/schema.sql` defines exactly five tables: `users`,
`arrival_profiles`, `user_tasks`, `reminder_prefs`, `support_tickets`.

The platform-era API routes reference many tables that **do not exist
anywhere in this repo**: `entitlements`, `billing_events`, `subscriptions`,
`checkout_sessions`, household/invitation tables, journey-task tables,
opportunity tables, notification tables, admin incident/work-item tables.

These routes compile clean (`tsc --noEmit` passes project-wide) and will
serve their static shell, but **will throw at runtime** the moment a
platform-era page does anything beyond first render. Do not treat a clean
TypeScript pass as evidence these routes work end to end — it isn't.

## Three places carry design-token truth, only one is canonical

1. `app/globals.css` `:root` — hybrid palette (navy `#0D2036`, teal
   `#0E7A78`, aqua `#46C8F1`, gold `#E8B95D`), Lexend display type. **This
   is canonical.** Used by landing, login, signup, all 16 checklist-era
   pages.
2. `app/globals.css`, appended block (~48KB, search for `.platform-shell`)
   — hardcoded hex, close cousin of but not identical to (1). Used by all
   17 platform-era pages. **Not reconciled.**
3. `mobile/lib/theme.ts` — one line, old flat palette (`#102A43` /
   `#0B7285`), matches (2)'s hex family, not (1). **Not reconciled.**

Don't add a fourth. If you're touching platform-era or mobile styling,
either follow the existing (2)/(3) palette deliberately, or do the Phase 2
reconciliation properly — don't half-migrate one file.

## Dev commands

```
npm install && npm run dev        # web, http://localhost:3456
npm run typecheck                 # tsc --noEmit — passes clean as of this writing
npm --prefix mobile install       # mobile — untested, do this before touching mobile/
npm --prefix mobile run typecheck
```

## Environment variables

From `.env.local` (web) — not all are wired to live services yet:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
SUPABASE_SERVICE_ROLE_KEY=        # server-only, never expose client-side
RESEND_API_KEY=                   # SDK installed, no live key
STRIPE_SECRET_KEY=                # SDK installed, no live key
STRIPE_WEBHOOK_SECRET=
BEGINLY_WEBHOOK_SECRET=           # guards /api/webhooks/resend
SEND_EMAIL_HOOK_SECRET=           # guards /api/auth/send-email-hook (Supabase Send Email Hook), see docs/AUTH_EMAIL_TEMPLATES.md
```

Mobile (`mobile/.env` or shell env):

```
EXPO_PUBLIC_BEGINLY_API_URL=      # defaults to http://localhost:3456
```

## Where the fuller picture lives

- `ROADMAP.md` — the 8-phase implementation plan (this file tells you what
  exists; that one tells you what to do next, in dependency order)
- `docs/implementation-roadmap.html` — visual twin of `ROADMAP.md`
- `docs/web-architecture.html` — the era/shell breakdown and schema-gap
  table in full, with source citations
- `docs/design-system.html` — token swatches, type specimen, component
  renders, the three-palette-locations table
- `docs/mobile-architecture.html` — the Expo app's resilience layers,
  `_layout.tsx` composition order, screen inventory

Open any of the four `docs/*.html` files directly in a browser — they're
self-contained, no build step.

## Things a first-time agent will likely get wrong without this file

- Assuming there's one design system. There are three token sources; only
  `globals.css` `:root` is canonical.
- Assuming a clean `tsc` means the platform-era routes work. It means they
  compile — the tables they query don't exist yet.
- Editing `components/Navbar.tsx` or `app/_components/LandingPageClient.tsx`
  expecting the change to appear anywhere. Both are dead code from the merge.
- Assuming `mobile/` is checked by the root `tsconfig.json`. It's
  deliberately excluded — it's a separate project with its own config.
- Assuming `admin/*` pages all share one shell. They don't, yet.
