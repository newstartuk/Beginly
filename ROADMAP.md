# Beginly Implementation Roadmap — 2026-07-13

> Superseded the June 2026 version of this file. Several of its P0 items (no
> landing page, no onboarding gate) are resolved by the work below. Visual
> version: `docs/implementation-roadmap.html`. See also `AGENTS.md` for the
> full project-context brief and `docs/web-architecture.html`,
> `docs/mobile-architecture.html`, `docs/design-system.html`.

## Status summary

| Phase | Status |
|---|---|
| 0 — Foundation (brand, landing page, platform code merge) | ✅ Complete |
| 1 — Data layer reconciliation | 🔴 Blocking, next up |
| 2 — Visual unification | 🟠 Ready to start |
| 3 — Core flow rebrand (onboarding, dashboard, checklist) | ⬜ Not started |
| 4 — Mobile bring-up | ⬜ Not started |
| 5 — Content & identity polish | ⬜ Not started |
| 6 — Provider activation (Stripe, Resend) | ⬜ Not started |
| 7 — QA & launch readiness | ⬜ Not started |

---

## ✅ Phase 0 — Foundation (complete)

- Stepping Stones logo — icon, primary lockup, monochrome, clearspace rule,
  entrance animation — implemented in header, nav, favicon (`components/Logo.tsx`)
- Hybrid design tokens (navy `#0D2036` / teal `#0E7A78` / aqua `#46C8F1` /
  gold `#E8B95D`), Lexend display type — evidence-matched via the
  `ui-ux-pro-max` design-system search, not guessed
- Landing page rebuilt: self-playing roadmap-preview card
  (`components/RoadmapPreviewCard.tsx`), hero entrance choreography,
  scroll-triggered reveals (`framer-motion`)
- Platform code merged from the `Beginly_All_Versions_Master_Archive_v1_0_to_v1_3`
  archive (v1.3 baseline, commit `94fee9068665b5807eec048675c09ead97a4047d`):
  - 90 new `app/` routes (Journey, Household, Opportunities, Products,
    Partners, admin operations/observability, SEO infra, legal pages)
  - 59 new `lib/` service files
  - 18 new `components/` files, including `components/platform/`
  - Full 51-file `mobile/` Expo app
  - ~48KB of platform-specific CSS appended to `app/globals.css` (brand
    tokens/components untouched)
  - `resolvePostAuthRedirect`/`withPostAuthIntent` wired into `login`/`signup`
- Added dependencies the merged code requires: `@supabase/ssr`, `resend`,
  `stripe`, `server-only`
- `mobile/` correctly excluded from the root `tsconfig.json` (separate Expo
  project, own config)
- `tsc --noEmit` passes clean project-wide; dev server verified against
  landing, `/journey` (correctly auth-redirects), and `/cities` (renders
  fully styled)

## 🔴 Phase 1 — Data layer reconciliation (blocking, next)

The newly merged API routes reference tables that likely don't exist in the
live Supabase project yet.

- [x] Audit every new API route (household, journey, opportunities, products,
      billing, admin) against the actual deployed schema — **56 missing
      tables found**, full inventory in `supabase/SCHEMA_AUDIT.md`
- [x] Write migration 001 (13 foundation tables — everything
      `loadPlatformContext()` and onboarding need on first render):
      `supabase/migrations/001_platform_foundation.sql`
- [x] Run migration 001 against the live Supabase project — ✅ executed 2026-07-13, no errors
- [ ] Write and run migrations 002–008 for the remaining 43 tables
      (household invitations, commerce/billing, opportunities/providers,
      partners/referrals/commission, Nia, admin/ops/governance,
      notifications/devices/webhooks/health) — sequencing and source files
      per domain in `supabase/SCHEMA_AUDIT.md`
- [x] RLS policies included in migration 001 for its 13 tables — repeat for
      each subsequent migration before any route goes live
- [ ] Smoke-test each new route against a real (or local) Supabase instance

**Why this blocks everything below:** the new pages render and compile
today, but without real tables behind them, Journey / Household /
Opportunities / Products will fail at runtime the moment a user interacts
past the static shell.

## 🟠 Phase 2 — Visual unification (ready to start, no blockers)

- [ ] Decide deliberately: adopt the hybrid brand tokens across platform
      pages, or keep the merged palette as an intentional distinct sub-brand
- [ ] Replace the plain `<div className="platform-brand-mark">B</div>` in
      `components/platform/PlatformShell.tsx` with the real `Logo` component
- [ ] Reconcile `components/Navigation.tsx` (sidebar, ours) against
      `components/Navbar.tsx` + `PlatformShell.tsx` (new) — pick which shell
      owns which route group, remove the unused one

## ⬜ Phase 3 — Core flow rebrand

Depends on Phase 2's shell/palette decision.

- [ ] Onboarding — still first-impression territory right after signup
- [ ] Dashboard — the highest-frequency touchpoint for a signed-up user
- [ ] Checklist / task detail pages

## ⬜ Phase 4 — Mobile bring-up

Depends on Phase 1 (mobile hits the same API routes).

- [ ] `npm --prefix mobile install`, resolve version conflicts
- [ ] Run via Expo dev client, smoke-test login, journey, Nia tabs
- [ ] Fix React Native–specific runtime issues (not caught by root `tsc`,
      which correctly excludes `mobile/`)

## ⬜ Phase 5 — Content & identity polish

No blockers — lowest-risk phase, run whenever capacity allows.

- [ ] Bespoke SVG illustration set for empty states/onboarding
      (`creating-svg-illustrations` skill installed, unused)
- [ ] Nia's visual identity — the beacon/orb concept from the design brief,
      with an idle animation

## ⬜ Phase 6 — Provider activation

Depends on Phase 1 (billing/entitlement tables must exist first).

- [ ] Wire real Stripe keys, verify checkout + webhook round-trip
      (`/api/webhooks/stripe`)
- [ ] Wire real Resend keys, verify transactional email
      (`/api/webhooks/resend`)
- [ ] Work through the activation runbooks already in the codebase docs
      (Supabase, Resend, Stripe, Nia, opportunity connectors, push,
      observability)

## ⬜ Phase 7 — QA & launch readiness

Depends on every phase above.

- [ ] Real interactive browser E2E — every prior evidence package recorded
      this as environmentally blocked, never passed
- [ ] Accessibility pass (WCAG 2.1/2.2 AA) against the merged pages
- [ ] Physical mobile device QA, signed build
- [ ] Controlled human pilot — no version to date has claimed one

---

## Out of scope for this update

Pre-existing strategy documents in the project root
(`BEGINLY_STRATEGIC_COMPENDIUM.md`, the Sir Edmund Hale briefs, the
`beginly_*_roadmap.html` files) are business-strategy and naming
exploration, not implementation status — not touched here.
