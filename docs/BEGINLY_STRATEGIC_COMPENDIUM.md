# BEGINLY STRATEGIC COMPENDIUM
## Master Plan v1.3+ — Living Document

**Status:** Draft for review | **Last Updated:** July 2026  
**Classification:** Internal strategy & product architecture  
**Sources:** NewStart UK v1.2 Master Pack, Beginly v1.2 Stabilisation Report, v1.3.6 Schema, Re-Evaluation Report, Referral Opportunity Engine Strategy, World-Class Vision, Design Brainstorm, Sir Edmund Hale Analysis, Weekend Launch Plan, and all HTML roadmap artifacts.

---

> **Note on the Master Pack:** The NewStart UK v1.2 Complete Master Pack is the foundational DNA of this project, but it is a **living document** — not a hard rule book. Every strategy, guardrail, and scope boundary within it exists to be tested, refined, and overwritten by evidence. This compendium synthesizes everything discovered across the Beginly artifact library, adds new strategic concepts not yet captured, and presents an integrated, actionable whole.

---

## PART I: EXECUTIVE SUMMARY

### What Beginly Is

Beginly is an **AI-assisted UK settlement platform** that helps newcomers — starting with international students — settle faster, avoid costly mistakes, and complete essential first steps through personalised roadmaps, reminders, plain-English guidance, scam intelligence, and trusted partner recommendations.

### The Core Philosophy

> **"Trust before monetisation. Guidance before advice. Action before information."**

Beginly does not replace lawyers, immigration advisers, doctors, or financial planners. It **closes the gap between "I don't know what I don't know" and "I know what to do next."**

### The Strategic Problem Beginly Solves

People arriving in the UK face a dense, scattered set of early tasks: accommodation, banking, GP registration, transport, SIM setup, council tax awareness, work readiness, document handling, budgeting, local safety, and community integration. The problem is not lack of information — it is that information is **scattered, generic, unsequenced, and often discovered only after a mistake has occurred.**

Beginly converts scattered settlement information into a **guided settlement journey.**

### The Strategic Pillars

![Beginly Strategic Pillars](beginly_strategic_pillars.png)

| Pillar | Meaning | Product Expression |
|---|---|---|
| **Plan** | Prepare before arrival | Pre-arrival checklist, document readiness, travel plan |
| **Settle** | Complete first steps | 90-day checklist, reminders, progress tracking |
| **Protect** | Avoid costly mistakes | Scam alerts, mistake-prevention warnings, verified partners |
| **Understand** | Make documents clearer | Document Helper, plain-English guidance, key-term explanation |
| **Connect** | Find safe support | Local guidance, partner marketplace, community links |
| **Grow** | Move beyond survival | Jobs, budgeting, housing stability, career and family support |

### The Five-Phase Vision

| Phase | Timeline | Focus | Target Segment |
|---|---|---|---|
| **1. Polish** | Weeks 1–4 | Stabilise, measure, launch | International students (B2C) |
| **2. Journey** | Weeks 5–12 | Timeline, badges, Nia 2.0 | International students (B2C) |
| **3. Nia AI** | Months 3–6 | Conversational memory, RAG, proactive nudges | All newcomers |
| **4. Community** | Months 6–12 | Cohorts, peer guides, ambassadors | City-based communities |
| **5. Scale** | Months 12–18 | B2B2C, white-label, embedded finance | Universities, employers, agents |

---

## PART II: CURRENT STATE ASSESSMENT

### The Honest Scorecard (from v1.2 Re-Evaluation + v1.3.6 Progress)

| Area | Score | Status |
|---|---|---|
| Public brand / domain | 8.5/10 | Strong — beginly.app is ownable, app-native, short |
| Landing page messaging | 8/10 | Directionally correct, needs warmth and social proof |
| Visual / UI direction | 7/10 | Direction A (Warm Companion) selected but not fully wired |
| Content library | 8/10 | 20+ guidance articles, covers core settlement topics |
| Compliance language | 7/10 | Good on public pages, uneven in Nia/helpers |
| Auth & data flow | 6/10 | v1.3.6 stabilised Supabase auth but needs validation at scale |
| Onboarding → dashboard | 6/10 | Working, but can be skipped; needs enforcement |
| Personalised roadmap | 6/10 | Tasks generated, but logic is still filter-based, not truly conditional |
| Admin functionality | 5/10 | v1.3.6 schema adds tables, but admin UI needs role hardening |
| Document Helper | 6/10 | Paste-text-only MVP is correct; no risky uploads |
| Production readiness | 6/10 | `next build` timeout fixed; Vercel deploy working |
| Analytics & tracking | 4/10 | Vercel Analytics enabled; GA4 and UTM tracking incomplete |
| Email / notifications | 5/10 | Resend welcome template exists; not yet triggered automatically |
| Opportunity Engine | 3/10 | Registry designed, schema tables created, not yet surfaced in UI |
| B2B partnerships | 2/10 | Outreach templates exist, zero live pilots |

### Critical Unresolved Blockers

1. **Onboarding skip:** Users can reach the dashboard without completing onboarding, leaving them at 0% readiness with no tasks.
2. **Analytics gap:** No product analytics (PostHog/Plausible) means we cannot measure the core activation loop.
3. **Landing page warmth:** The landing page is functional but lacks the emotional resonance of Direction A.
4. **Email automation:** Welcome emails are designed but not auto-triggered on email confirmation.
5. **City-specific SEO:** Only generic landing page exists; no city/university long-tail pages.

---

## PART III: PRODUCT ARCHITECTURE & CONCEPTS

### 3.1 The v1.3.6 Schema Foundation

The v1.3.6 schema patch (`BEGINLY_SCHEMA_PATCH_v136_FIXED.sql`) represents the **data layer for the next 18 months**. It is self-contained, creates all missing tables before altering them, and seeds training modules.

**New Tables Added:**

| Table | Purpose | RLS Status |
|---|---|---|
| `notification_preferences` | Granular opt-in for email, in-app, opportunity, safety, weekly digest | User-managed |
| `user_notifications` | Notification inbox with read/archived/dismissed states | User + admin |
| `notification_delivery_log` | Delivery tracking (Resend, in-app, push) | Admin only |
| `safety_cases` | Scam/housing safety case management with severity levels | Admin only |
| `opportunities` | Jobs, events, training, volunteer listings with status workflow | Admin + authenticated read (published) |
| `partner_leads` | B2B CRM for university/employer partnerships | Admin only |
| `referral_disclosures` | Compliance tracking for referral links | Admin only |
| `training_modules` | Ambassador/peer-guide training content | Admin-managed |
| `user_milestones` | Badge/achievement system | User + admin |
| `scam_reports` | User-submitted scam reports with evidence URLs | User + admin |

**Schema Philosophy:** Every new table is created with `IF NOT EXISTS`, then RLS is enabled, then policies are dropped and recreated. This makes the patch idempotent and safe to re-run.

### 3.2 The Feature Flag System

`lib/feature-flags.ts` controls which layers are active:

```typescript
ENABLE_NIA_V2      // Conversational guide with scoped memory
ENABLE_JOURNEY     // 90-day timeline, settlement score, milestones
ENABLE_INTELLIGENCE // Scam Radar, paste-check, deadline tracker
ENABLE_COMMUNITY_LITE // Cohort cards, ambassador applications
```

**Rule:** Flags default to `true` for local dev, `false` for production until the feature passes its acceptance gate. Override via environment variables (`FF_NIA_V2=false`).

### 3.3 Nia — The Beginly Navigator

**Current State (v1.2):** Nia is a functional AI assistant with guardrails. She refuses legal, immigration, financial, tax, and medical advice. She explains documents in plain English. She is not yet a companion.

**Nia 2.0 Vision (from World-Class Vision):**

![Nia 2.0 Architecture](beginly_nia2_architecture.png)

| Feature | Description | Effort | Priority |
|---|---|---|---|
| **Persistent Memory** | Remembers past conversations across sessions | Medium | High |
| **Proactive Check-ins** | Nudges at the right moment: "Have you registered with a GP yet?" | Low | High |
| **RAG Chat Interface** | Conversational answers using guide content as knowledge base — no hallucination | Medium | Flagship |
| **Multilingual** | Auto-detect or let users pick: Yoruba, Igbo, Hindi, Urdu, Tagalog, Mandarin | Medium | Massive reach |
| **Voice Mode** | Speak to Nia; she responds conversationally | High | Later |

**Nia Disclosure Reframe (from Sir Edmund Hale cross-pollination):**

> *"Nia is AI-powered. That means she's available at 2 AM when you can't sleep because you're worried about your council tax letter. She never gets tired, she knows the latest rules, and she'll tell you when she doesn't know something. But she's not a lawyer, a doctor, or an immigration adviser — and she'll always say so."*

This turns a legal liability into a **product feature.**

### 3.4 The Opportunity Engine

(from `Beginly_Referral_Opportunity_Engine_Strategy_v1_0`)

**Core Principle:** Beginly does not sell links. Beginly surfaces timely settlement opportunities. Where a trusted partner link genuinely helps, it is clearly disclosed and used.

**The 100-Point Opportunity Score:**

![Opportunity Score Framework](beginly_opportunity_score.png)

| Area | Weight | Rule |
|---|---|---|
| User Value | 30% | Must genuinely help the user |
| Settlement Relevance | 20% | Must match user's stage and context |
| Trust/Safety Fit | 20% | Must not undermine guidance-first posture |
| Compliance Simplicity | 15% | Lower-risk opportunities launch earlier |
| Revenue Potential | 10% | Secondary internal signal only |
| Implementation Ease | 5% | Quick wins still pass all gates above |

**Ranking Logic:** `User Value > Settlement Relevance > Trust Fit > Compliance > Revenue > Ease`

**The Opportunity Scanner (Dashboard Card):**

```
┌─────────────────────────────────────────┐
│  Opportunity Scanner                    │
│  Nia found 4 useful opportunities for    │
│  your current stage.                    │
│                                         │
│  🔴 Safety    Check housing deposit     │
│               warning signs             │
│  📋 Setup     Prepare bank documents    │
│  💰 Savings   Compare student transport │
│  📖 Guide     Review GP registration    │
│                                         │
│  Shown because you're in your first    │
│  7 days and haven't completed          │
│  transport, bank, or GP tasks.         │
└─────────────────────────────────────────┘
```

**Surfaces Where Opportunities Appear:**
1. **Dashboard Scanner** — weekly feed of relevant opportunities
2. **Task Detail Pages** — contextual "Related options" panel
3. **Budget Planner** — savings prompts when spend is high in a category
4. **Guide Articles** — governed content-referral blocks with disclosure
5. **Nia Responses** — explains why an opportunity was shown, never ranks by commission
6. **Reminder Emails** — weekly scan links to a guide with a clearly labelled partner section

**User Controls:**
- Save opportunity (creates personal list)
- Dismiss opportunity (teaches engine preferences)
- Hide category (e.g., "I never want partner offers")
- Report bad recommendation (protects trust)
- "Why shown?" — transparent trigger explanation

**Governance Requirements (Non-Negotiable):**
- Every partner verified before listing
- Affiliate disclosure on every referral link
- Neutral comparison language (no "best", no "guaranteed")
- Admin review console before any monetised link goes live
- Complaint tracking with auto-suspend thresholds
- No mixing of official sources with paid partners without clear labels

### 3.5 The Journey Layer (from World-Class Vision)

**Settlement isn't a checklist — it's a journey. The product should feel like one.**

| Feature | Description | Effort | Impact |
|---|---|---|---|
| **90-Day Visual Timeline** | Scrollable arc from arrival date to Day 90. Tasks plotted. Completed milestones get a green marker. | Medium | Signature screen |
| **Settlement Score** | Score out of 100 based on task completion across categories. Visible progress, not just done/undone. | Low | High engagement |
| **Achievement Badges** | "Bank account opened", "GP registered", "NI number received". Shareable card: "I'm settled — Beginly helped me do it in 90 days." | Low | Viral loop |
| **Calendar Sync** | "Add to Google Calendar" on any task with a deadline. Exports `.ics` with pre-set reminders. | Low | Practical utility |
| **Pre-Arrival Mode** | Whole task layer before landing: UKVI health surcharge, travel insurance, set up Monzo before arrival, what to pack. Unlocks arrival tasks on landing. | Medium | Expands TAM |

**Pre-Arrival Mode is Critical:** It turns Beginly from a "day 1" product into a "decision" product. If a student discovers Beginly 3 months before their visa interview, they have 90 days of engagement before they even need the checklist. This is when the emotional bond forms.

### 3.6 The Intelligence Layer (from World-Class Vision)

| Feature | Description | Data Source | Effort |
|---|---|---|---|
| **UK Scam Radar** | Live feed of scams targeting new arrivals. Fake landlords, UKVI impersonation texts, BRP courier scams. "Paste a suspicious message — Nia will tell you if it's a scam." | User reports + admin curation + web scraping | Medium |
| **Document Expiry Tracker** | Enter visa expiry, BRP expiry, passport expiry. Warns at 90/60/30 days. "Your student visa expires in 47 days — here's exactly what to do now." | User input + notification engine | Low |
| **Hyperlocal Guidance** | Enter postcode → nearest GP accepting new patients, local council contact, nearest UKVI service centre. | NHS/GOV.UK APIs or manual data | Medium |
| **Peer Insight Engine** | "Others with your visa type from Nigeria typically complete the bank account task in week 2 — you're on track." | Anonymous aggregate data | Needs scale |

**Scam Radar is the Unique Moat:** No competitor offers a live, community-fed scam detection system for international students. This is a genuine safety feature that builds trust and creates daily-use habit.

### 3.7 The Community Layer (from v1.3.6 Schema + Master Pack)

**Principle:** No open forums, no DMs, no unmoderated advice. Cohorts remain opt-in and manually reviewed during MVP.

| Feature | Description | Safeguard |
|---|---|---|
| **City Cohorts** | Auto-join by city + arrival month. Anonymous Q&A. | No DMs, no marketplace, admin review |
| **Peer Advisor Programme** | Students who complete 90 days can apply to be peer advisors. 15-min video calls, matched by nationality + university. | All advisors complete training modules. Calls recorded. Admin review queue. |
| **Ambassador Network** | Student ambassadors share official content, collect questions, refer users. | Cannot give regulated advice. Cannot charge users. Cannot collect sensitive documents. |
| **Training Modules** | Pre-seeded in v1.3.6: Advice Boundaries, Safety Escalation, Community Conduct | Required before any community role |

### 3.8 Design Direction: Warm Companion (Direction A — Recommended)

(from `direction_a_warm_companion.html` and `beginly_design_brainstorm.html`)

**The Four Directions Explored:**

| Direction | Palette | Feel | Verdict |
|---|---|---|---|
| **A — Warm Companion** | Teal + Amber + Soft wash | Knowledgeable friend | **Recommended** |
| **B — Bold Clarity** | Navy + Electric teal | Premium, government-grade | Too cold for students |
| **C — Human Journey** | Terracotta + Sage | Illustration-heavy, emotional | Biggest change, highest risk |
| **D — Dark Mode First** | Deep slate + Bright teal | Modern, app-native | Risky for trust |

**Direction A Implementation Tiers:**

- **Tier 1 (~1 hour):** Add amber to Tailwind config, soften border-radius, add `.btn-amber` class
- **Tier 2 (~1 day):** Change landing CTA to amber, add Nia avatar bubble, update navigation active indicator
- **Tier 3 (~3 days):** Add personalised greeting, "Day N" counter, category progress bars, milestone banner

**Key Landing Page Variants Tested:**

| Variant | Headline | CTA | Feel |
|---|---|---|---|
| Current | "Your UK settlement journey starts here." | Teal button | Functional |
| Warm A | "New to the UK? You've got this." | Amber button | Friendly |
| Bold B | "Everything you need. Nothing you don't." | Navy/cyan | Authoritative |
| Journey C | "Day 1 in the UK is just the beginning." | Sage green | Emotional |

**Recommendation:** Implement Warm A immediately. It is the lowest-risk, highest-resonance direction for the target audience.

---

## PART IV: GROWTH & DISTRIBUTION ENGINE

### 4.1 The B2C Growth Funnel

![Beginly Growth Funnel](beginly_growth_funnel.png)

| Stage | Channel | Conversion Target | Tactic |
|---|---|---|---|
| **Discovery** | TikTok, Reddit, Instagram, SEO | 100K views/month | Short-form video + helpful answers |
| **Lead Magnet** | Landing page PDF download | 5% of visitors | First 7 Days PDF, Scam Sheet, Bank Comparison |
| **Signup** | beginly.app/signup | 15% of magnet downloads | 2-minute onboarding, city + uni + arrival date |
| **Activation** | First 3 tasks complete | 40% of signups | Onboarding forces task generation, not skippable |
| **Retention** | Weekly check-ins, Nia nudges | 25% D7 return | Email reminders + in-app notifications |
| **Revenue** | Partner referrals + premium | 3% of active users | Contextual, value-triggered, disclosed |

### 4.2 The Short-Form Video Gap

**The Honest Truth:** Beginly has zero TikTok/Shorts presence. The Weekend Launch Plan covers Reddit, Google Ads, Meta, and WhatsApp — but **short-form video is where international students live.**

**The Sir Edmund Hale Model Applied:**
- 30-second hook
- No voiceover needed (text on screen + trending audio)
- Topic: "5 mistakes every international student makes in Week 1"
- Format: Hook (3s) → Mistake 1 (5s) → Mistake 2 (5s) → Mistake 3 (5s) → Solution (5s) → CTA (7s)

**5 Videos to Record This Week:**
1. "The council tax letter that looks scary but isn't"
2. "5 mistakes in your first week in the UK"
3. "How to open a UK bank account without proof of address"
4. "The housing scam 1 in 3 students almost fall for"
5. "What your university won't tell you about GP registration"

**Tool:** CapCut (free). Post to TikTok and YouTube Shorts. Add UTM tracking to bio link.

### 4.3 The Content SEO Engine

**Long-Tail City Landing Pages:**

Create 10 city-specific pages. Each has:
- City-specific checklist (first 7 days)
- City-specific scam warnings
- "Students at [University Name]" social proof line
- Local partner links (if any)

**Target Keywords:**
- "moving to Manchester as an international student"
- "first week in Sheffield student"
- "London student bank account without proof of address"
- "Birmingham accommodation scams 2026"

**Blog Content from Guide Articles:**
Every guidance article should be republished as a blog post with:
- One specific name (bank, service, council)
- One specific number (fee, deadline, threshold)
- One specific official link (GOV.UK, NHS, university)
- A "Read this in the app" CTA at the bottom

### 4.4 The B2B2C Distribution Model

![B2B2C Distribution Model](beginly_b2b2c_model.png)

**The Universities Angle:**

Universities are the gatekeepers. International student retention is a KPI. A student who drops out in the first 90 days because they couldn't open a bank account or register with a GP represents £20,000+ in lost tuition. Beginly is cheap insurance.

**The Pilot Structure:**
1. Target 3 universities with large international student populations (Manchester, Sheffield, Birmingham)
2. Offer a **free pilot** for one intake cycle (September 2026)
3. University provides: student email list (with consent), logo/branding, landing page slot in welcome portal
4. Beginly provides: pre-populated arrival profiles, branded app, admin dashboard showing cohort analytics

**The Invite Token Flow:**
- University generates a token for each admitted student
- Student clicks `/onboarding?token=abc123`
- Pre-filled with university, course, arrival date
- Friction reduced by 80%

**Revenue Model:**
- **B2B License:** £500–£2,000 per university per semester
- **B2C Referral:** Commission on verified partner conversions
- **Premium Subscriptions:** Beginly Plus/Premium for individual users
- **White-Label:** Co-branded onboarding portals for institutional clients

**The Three-Phase B2B Approach:**

| Phase | Action | Timeline |
|---|---|---|
| **1. Warm Outreach** | Email international student offices. Offer free resource. No pitch. | Weeks 1–4 |
| **2. Pilot Proposal** | 1-page pilot proposal: 100 students, 90 days, anonymised report | Weeks 5–8 |
| **3. Scale** | Case study from pilot → proposal to 10 more universities | Weeks 9–18 |

---

## PART V: THE SIR EDMUND HALE CROSS-POLLINATION

### What Beginly Should Borrow

**The master pack correctly rejected the fake persona. But the master pack did not fully capture the content architecture that makes fake personas work. Beginly can have all of it with a real voice.**

| Sir Edmund Hale Tactic | Beginly Application | Difficulty | Impact |
|---|---|---|---|
| **Specificity as trust signal** | Name specific banks, specific fees, specific deadlines in every guide | Easy | High |
| **74-page lead magnet** | "First 7 Days" PDF, "Scam Warning Sheet", "Bank Comparison 2026" | Medium | High |
| **Short-form video funnel** | 5 TikToks this week, 2 per week ongoing | Medium | High |
| **Tripwire content architecture** | Every completed task surfaces a "What's next" guide or partner card | Easy | Medium |
| **Disclosure as brand strength** | Reframe Nia's AI disclosure as a feature, not a liability | Trivial | Medium |
| **Anti-positioning table** | "Beginly vs. Generic Blogs vs. Facebook Groups vs. Uni Welcome Pack" | Easy | High |
| **Content flywheel from data** | Weekly "Beginly Intelligence Brief" from anonymised support tickets + scam reports | Easy | High |
| **Historical anchoring** | Real founder story: "I built this because I watched friends struggle" | Trivial | Very High |
| **City-specific SEO** | 10 city landing pages | Medium | High |
| **Ambassador as cast of characters** | Real student profiles: "Ade, Nigeria, Manchester Met, Year 2" | Medium | Medium |

### What Beginly Should Reject

| Sir Edmund Hale Element | Rejection Reason | Replacement |
|---|---|---|
| Fake literary persona | Violates trust-first principle | Real founder voice + real student ambassadors |
| Fictional backstory | Risk of "fake guru" perception | Real founding story |
| One-time payment only | Limits sustainable growth | Freemium + subscription + B2B license |
| No community | Limits network effects | Moderated city cohorts + peer advisors |
| AI disclosure hidden on page 72 | Not transparent enough | Disclosure framed as feature, front and centre |

---

## PART VI: THE 90-DAY EXECUTION ROADMAP

![90-Day Execution Roadmap](beginly_90day_roadmap.png)

### Phase 1: Polish & Launch (Weeks 1–4)

**Goal:** 100 onboarded, active users. Analytics operational. Landing page converting.

| Week | Action | Owner | Acceptance Criteria |
|---|---|---|---|
| 1 | Set up PostHog/Plausible product analytics | Engineering | Onboarding completion rate tracked |
| 1 | Apply Direction A CSS tokens (amber, warmth) | Design | All CTAs use amber; Nia has avatar bubble |
| 1 | Fix onboarding skip (force completion before dashboard) | Engineering | 0% of users reach dashboard without profile |
| 2 | Build 3 lead magnet PDFs | Content | A4, branded, QR code to beginly.app |
| 2 | Record 5 TikTok/YouTube Shorts | Growth | Posted with UTM tracking |
| 3 | Create 10 city-specific landing pages | SEO | Indexed by Google; 1 ranking within 30 days |
| 3 | Add comparison table to landing page | Design | "Beginly vs. alternatives" live |
| 4 | Auto-trigger welcome email on confirmation | Engineering | 100% of confirmed users receive email within 5 min |
| 4 | Launch Reddit organic + Google Ads test | Growth | 50 signups from paid; 50 from organic |

**Gate 1:** 100 onboarded users with >60% onboarding completion rate.

### Phase 2: Trust & Content (Weeks 5–8)

**Goal:** 1,000 signups. Email sequences live. Content engine running.

| Week | Action | Owner | Acceptance Criteria |
|---|---|---|---|
| 5 | Launch weekly "Beginly Intelligence Brief" email | Content + Data | 5 bullet points from real user data |
| 5 | Implement task completion cross-sell cards | Engineering | 20% of completed tasks surface a "What's next" |
| 6 | A/B test landing page variants (Current vs. Warm A) | Growth | 2% conversion rate improvement |
| 6 | Build Nia proactive check-in system (5 core nudges) | Engineering | Day 3, Day 7, Day 14, Day 30, Day 60 |
| 7 | Launch first university outreach campaign (10 emails) | BD | 3 positive responses |
| 7 | Add social proof section to landing page (3 testimonials + flags) | Design | Real names, countries, photos |
| 8 | Implement document expiry tracker MVP | Engineering | 3 document types: visa, BRP, passport |

**Gate 2:** 1,000 signups; 3 university positive responses; 25% D7 return rate.

### Phase 3: Partnerships (Weeks 9–12)

**Goal:** 1 live university pilot. White-label MVP. B2B deck.

| Week | Action | Owner | Acceptance Criteria |
|---|---|---|---|
| 9 | Close first university pilot (100–500 students) | BD | Signed pilot agreement |
| 9 | Build white-label CSS override system (`[data-theme="uom"]`) | Engineering | 3 CSS variables changed per partner |
| 10 | Implement invite token onboarding flow | Engineering | Token pre-fills university, course, arrival date |
| 10 | Build admin dashboard for partner analytics | Engineering | Cohort-level anonymised metrics |
| 11 | Launch Opportunity Scanner MVP | Engineering | 5 opportunities live; 100-point score enforced |
| 11 | Add partner vetting workflow to admin | Ops | 3-step verification before any link goes live |
| 12 | Run pilot post-mortem + case study | PM | Report: activation rate, task completion, NPS |

**Gate 3:** 1 live pilot with >70% student activation.

### Phase 4: Scale & Revenue (Weeks 13–18)

**Goal:** 10 university partners. £5K MRR from B2B + referrals. Premium tiers launched.

| Week | Action | Owner | Acceptance Criteria |
|---|---|---|---|
| 13 | Expand to 10 university partners | BD | 3 live, 7 in pipeline |
| 13 | Launch Nia 2.0 RAG chat interface (beta) | Engineering | Uses guide content; zero hallucination tolerance |
| 14 | Launch Premium tier (£9.99/month) | Product | Document expiry tracker + priority Nia + calendar sync |
| 15 | Launch Scam Radar MVP | Engineering | 5 scam types; user paste-check working |
| 16 | Launch pre-arrival mode | Engineering | 15 tasks before arrival; unlocks on landing |
| 17 | Launch peer advisor beta (city cohorts) | Community | 10 advisors; 50 calls completed |
| 18 | Month 6 review: MRR, retention, NPS, expansion revenue | PM | Board-ready metrics deck |

---

## PART VII: RISK REGISTER & DECISION GATES

### Known Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| University sales cycle >6 months | High | High | Start outreach immediately; offer free pilot; use warm intros |
| Reddit/TikTok promotion banned or ignored | Medium | Medium | Lead with value, not product. 80/20 rule. |
| B2B revenue doesn't materialise | Medium | High | B2C referrals + premium tiers are parallel tracks |
| Competitor copies feature set | High | Medium | Network effects (peer data, advisor matching, cohorts) are the moat |
| GDPR/compliance issues | Medium | High | Privacy Policy + ToS now live; DPA before any B2B contract |
| Nia hallucinates on sensitive topic | Medium | Catastrophic | RAG-only for factual answers; guardrails tested; human escalation |
| `next build` timeout returns | Low | High | Monitor Vercel builds; use `cleanup-build.js` script |
| Feature flags accidentally enable unfinished features | Medium | Medium | Env-var control only; no UI toggles for MVP |

### Decision Gates

| Gate | Criteria | If Failed |
|---|---|---|
| **Gate 1 (Week 4)** | 100 onboarded users, >60% completion | Pause paid ads; fix onboarding friction; re-test |
| **Gate 2 (Week 8)** | 1,000 signups, 25% D7 return, 3 uni responses | Re-evaluate channels; double down on organic; adjust messaging |
| **Gate 3 (Week 12)** | 1 live pilot, >70% activation | Pivot pilot terms; offer more support; extend timeline |
| **Gate 4 (Week 18)** | 10 partners, £5K MRR | Shift revenue mix toward B2C premium; reduce B2B dependency |

---

## PART VIII: FEATURE PRIORITY MATRIX

![Feature Priority Matrix](beginly_priority_matrix.png)

### Quick Wins (High Impact, Low Effort) — Do This Week

1. Add amber CTA buttons (Direction A)
2. Rewrite Nia disclosure as feature
3. Add comparison table to landing page
4. Fix onboarding skip bug
5. Set up analytics (PostHog/Plausible)
6. Generate "First 7 Days" PDF

### Major Projects (High Impact, High Effort) — Plan for Phase 2–3

1. University partnership pilots
2. Opportunity Engine (full scanner + registry)
3. Nia 2.0 RAG chat interface
4. Scam Radar live feed
5. White-label portal system

### Fill-Ins (Low Impact, Low Effort) — Do When Bored

1. Dark mode toggle
2. Additional badge animations
3. More colour variants in design system

### Avoid / Defer (Low Impact or High Risk)

1. Native iOS/Android app (use PWA)
2. Bank fast-track partnership (needs 10K+ users first)
3. Geofencing/radius alerts (needs native app)
4. Full document upload + OCR (compliance risk)

---

## PART IX: IMMEDIATE ACTION ITEMS

### This Week (7 Tasks)

| # | Task | Time | Owner | Blocker |
|---|---|---|---|---|
| 1 | Add amber CTA + Direction A CSS tokens | 1 hour | Engineering | None |
| 2 | Fix onboarding skip (redirect incomplete profiles back to onboarding) | 2 hours | Engineering | None |
| 3 | Set up PostHog or Plausible for product analytics | 2 hours | Engineering | None |
| 4 | Rewrite Nia disclosure copy as feature, not liability | 15 min | Content | None |
| 5 | Add "Beginly vs. alternatives" comparison table to landing page | 30 min | Design | None |
| 6 | Draft "First 7 Days" PDF (1 page, A4, branded, QR code) | 3 hours | Content | None |
| 7 | Record 3 TikTok shorts (phone + CapCut) | 3 hours | Growth | None |

### This Month (4 Milestones)

1. **100 onboarded users** — via Reddit organic + Google Ads test + grad network
2. **City landing pages live** — 3 pages minimum (Manchester, London, Sheffield)
3. **Welcome email auto-triggered** — Resend integration on Supabase webhook
4. **3 university outreach emails sent** — warm, no-pitch, resource-first

### This Quarter (3 Objectives)

1. **1,000 signups** with >25% D7 retention
2. **1 live university pilot** with >70% student activation
3. **Opportunity Scanner MVP** live with 5 verified, disclosed partner links

---

## APPENDIX A: DOCUMENT REFERENCE LIBRARY

| Document | Location | Key Contribution |
|---|---|---|
| NewStart UK v1.2 Master Pack | `Resources/00_NewStart_UK_Complete_Master_Pack.pdf` | Foundation strategy, 6 pillars, compliance guardrails, content architecture |
| Beginly v1.2 Stabilisation Report | `BEGINLY_V1_2_STABILISATION_REPORT.md` | Auth fix, schema alignment, RLS, Nia guardrails, rebrand cleanup |
| v1.3.6 Schema Patch | `BEGINLY_SCHEMA_PATCH_v136_FIXED.sql` (in zip) | 9 new tables, notification system, opportunity registry, training modules |
| Re-Evaluation Report | `Resources/Beginly_v1_2_Re_Evaluation_Report.pdf` | Honest scorecard, specific gaps, next sprint priorities |
| Referral Opportunity Engine | `Resources/Beginly_Referral_Opportunity_Engine_Strategy_v1_0.pdf` | 100-point scoring, contextual referrals, governance, revenue model |
| Design Brainstorm | `beginly_design_brainstorm.html` | 4 directions, screen-by-screen improvements, landing variants |
| Direction A Warm Companion | `direction_a_warm_companion.html` | Mobile mockups, colour tokens, component spec, screen previews |
| World-Class Vision | `beginly_worldclass_vision.html` | Nia 2.0, Journey layer, Intelligence layer, Community layer, Pre-arrival mode |
| Implementation Roadmap | `beginly_implementation_roadmap.html` | 5-phase detailed build plan with dependencies |
| Product Roadmap | `beginly_product_roadmap.html` | Feature sequencing, decision criteria, acceptance gates |
| Complete Roadmap v2 | `beginly_complete_roadmap_v2.html` | Full 18-month timeline with month-by-month milestones |
| Weekend Launch Plan | `Downloads/Beginly_Weekend_Launch_Plan.docx` | Tactical 100-user acquisition plan, ad copy, UTM tracking, day-by-day execution |
| Sir Edmund Hale Analysis | `Sir_Edmund_Hale_Analysis_Report.md` | Persona architecture, content specificity, tripwire design, disclosure strategy |
| Sir Edmund Hale 1000x Brief | `Sir_Edmund_Hale_1000x_Strategic_Brief.md` | AI companion blueprint, subscription tiers, content flywheel, go-to-market engine |
| Alternative 1000x Angles | `Alternative_1000x_Angles_and_Proven_Niches.md` | 10 alternative business models, data-proven niches, market sizing |
| Design System | `docs/DESIGN_SYSTEM.md` | Typography, spacing, colour tokens, component patterns, responsive rules |
| Developer Action Prompt | `docs/DEVELOPER_ACTION_PROMPT.md` | Supabase connection, schema application, RLS, auth guards, local dev setup |

---

## APPENDIX B: KEY METRICS DASHBOARD

| Metric | Current | Target (Week 4) | Target (Week 12) | Target (Week 18) |
|---|---|---|---|---|
| Total signups | — | 100 | 1,000 | 5,000 |
| Onboarding completion rate | — | 60% | 70% | 75% |
| First 3 tasks complete | — | 40% | 50% | 55% |
| Day-7 return rate | — | 15% | 25% | 30% |
| Day-30 retention | — | 5% | 15% | 20% |
| Nia engagement rate | — | 10% | 15% | 20% |
| University pilot conversations | — | 3 | 1 live | 10 live |
| Monthly recurring revenue | — | £0 | £500 | £5,000 |
| Support tickets (weekly) | — | <10 | <20 | <50 |
| Scam reports submitted | — | 5 | 25 | 100 |

---

## APPENDIX C: THE COMPLETE CONCEPT INVENTORY

Below is every strategic concept, feature idea, and architectural pattern discovered across the entire Beginly artifact library, organised by layer.

### Product Concepts

| Concept | Source | Status | Priority |
|---|---|---|---|
| Personalised 90-day checklist | Master Pack | Live | Core |
| Task dependency logic | Master Pack | Partial | High |
| Stage-based task visibility (PRE, D1, D7, D30, D90) | Master Pack | Live | Core |
| Readiness score (0–100) | Master Pack | Live | Core |
| Reminder preferences + email nudges | Master Pack | Partial | High |
| Document Helper (paste-text-only) | Master Pack | Live | Core |
| Scam & mistake alerts | Master Pack | Live | Core |
| Guidance library (20+ articles) | Master Pack | Live | Core |
| Feature flag system | v1.3.6 zip | Live | Infrastructure |
| Notification engine (in-app + email) | v1.3.6 schema | Designed | High |
| Opportunity Scanner | Opportunity Engine | Designed | High |
| Opportunity Registry (100-point score) | Opportunity Engine | Designed | High |
| Contextual referral-in-content | Opportunity Engine | Designed | High |
| Geo/radius-sensitive prompts | Opportunity Engine | Designed | Medium |
| Package notification engine | Opportunity Engine | Designed | Medium |
| Consent & disclosure framework | Opportunity Engine | Designed | High |
| Admin review console | Opportunity Engine | Designed | High |
| Nia 2.0 persistent memory | World-Class Vision | Concept | High |
| Nia 2.0 proactive check-ins | World-Class Vision | Concept | High |
| Nia 2.0 RAG chat interface | World-Class Vision | Concept | Flagship |
| Nia 2.0 multilingual | World-Class Vision | Concept | Massive reach |
| 90-day visual timeline | World-Class Vision | Concept | Signature |
| Settlement score + badges | World-Class Vision | Concept | High |
| Calendar sync (.ics export) | World-Class Vision | Concept | Medium |
| Pre-arrival mode | World-Class Vision | Concept | TAM expansion |
| UK Scam Radar | World-Class Vision | Concept | Unique moat |
| Document expiry tracker | World-Class Vision | Concept | High |
| Hyperlocal guidance by postcode | World-Class Vision | Concept | Medium |
| Peer insight engine | World-Class Vision | Concept | Network effect |
| City cohorts | v1.3.6 schema + Master Pack | Designed | Medium |
| Peer advisor programme | v1.3.6 schema + Master Pack | Designed | Medium |
| Ambassador network | v1.3.6 schema + Master Pack | Designed | Medium |
| Training modules (pre-seeded) | v1.3.6 schema | Live | Governance |
| White-label CSS overrides | Master Pack | Designed | B2B enabler |
| Invite token onboarding | Master Pack | Designed | B2B enabler |
| B2B analytics dashboard | Master Pack | Designed | B2B enabler |

### Growth & Distribution Concepts

| Concept | Source | Status | Priority |
|---|---|---|---|
| Reddit organic (help-first answers) | Weekend Launch Plan | Active | High |
| Google Search Ads | Weekend Launch Plan | Designed | High |
| Reddit Ads | Weekend Launch Plan | Designed | High |
| Meta Ads (Facebook/Instagram) | Weekend Launch Plan | Designed | Medium |
| Graduated student network (WhatsApp) | Weekend Launch Plan | Designed | High |
| Micro-influencer outreach | Weekend Launch Plan | Designed | Medium |
| Immigration lawyer outreach | Weekend Launch Plan | Designed | Medium |
| University international office outreach | Weekend Launch Plan | Designed | High |
| Lead magnet PDFs | Weekend Launch Plan + Sir Edmund Hale | Designed | High |
| Short-form video (TikTok/YouTube Shorts) | Sir Edmund Hale + Weekend Launch Plan | Not started | Critical gap |
| City-specific SEO landing pages | Sir Edmund Hale cross-pollination | Designed | High |
| Content flywheel from user data | Sir Edmund Hale 1000x brief | Designed | Medium |
| Weekly "Beginly Intelligence Brief" | Sir Edmund Hale cross-pollination | Designed | Medium |
| Comparison table (anti-positioning) | Sir Edmund Hale | Designed | High |
| Historical anchoring (founder story) | Sir Edmund Hale cross-pollination | Designed | High |
| Ambassador as cast of characters | Sir Edmund Hale cross-pollination | Designed | Medium |
| B2B2C university distribution | Phased Strategy | Designed | Critical |
| White-label pilot programme | Phased Strategy | Designed | High |
| Partner marketplace | Opportunity Engine | Designed | Medium |
| Premium subscription tiers | Opportunity Engine | Designed | Medium |
| Corporate wellness / employer benefit | Alternative 1000x Angles | Concept | Later |
| Physical-digital hybrid (ledger, envelopes) | Alternative 1000x Angles | Concept | Later |

### Design & UX Concepts

| Concept | Source | Status | Priority |
|---|---|---|---|
| Direction A: Warm Companion | Design Brainstorm | Selected | Implement now |
| Direction B: Bold Clarity | Design Brainstorm | Rejected | — |
| Direction C: Human Journey | Design Brainstorm | Rejected | — |
| Direction D: Dark Mode First | Design Brainstorm | Rejected | — |
| Amber CTA buttons | Direction A | Not live | This week |
| Nia avatar bubble | Direction A | Not live | This week |
| Personalised greeting ("Good morning, Amara") | Direction A | Not live | This week |
| "Day N in the UK" counter | Direction A | Not live | This week |
| Category progress bars | Direction A | Not live | This week |
| Milestone banner (25%, 50%, 75%, 100%) | Direction A | Not live | This week |
| Satisfying check animation | Design Brainstorm | Not live | Medium |
| Interactive UK map (city selection) | Design Brainstorm | Concept | Medium |
| Illustrated visa type cards | Design Brainstorm | Concept | Medium |
| Landing page illustration | Design Brainstorm | Not live | Medium |
| Testimonial section with country flags | Design Brainstorm | Not live | This week |
| "How it works" 3-step section | Design Brainstorm | Not live | This week |
| Trust signals (free, no legal advice, privacy-first) | Design Brainstorm | Not live | This week |

---

*End of Beginly Strategic Compendium v1.3+*

*This document is a living synthesis. Update it when new evidence changes the strategy. Do not let the plan override reality — let reality refine the plan.*
