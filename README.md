# SettleMap

**Your guided settlement platform for the UK — built for everyone arriving in the UK, within 90 days.**

SettleMap helps new immigrants, international students, skilled workers, and all newcomers arriving in the UK get settled quickly, safely, and with confidence. From opening a bank account to understanding the NHS, SettleMap provides a personalised checklist, step-by-step guidance, and a UK-readiness score — all in one place.

> 🚨 **Note:** SettleMap is an orientation and information tool. It does **not** provide immigration, legal, medical, or financial advice. Always verify critical information at [GOV.UK](https://www.gov.uk) and consult qualified professionals for anything requiring regulated advice. See our [full disclaimer](#disclaimer) below.

---

## ✨ Features

- **Personalised 90-day settlement roadmap** — tasks organised by stage: pre-arrival, day 1, week 1, month 1, and months 1–3
- **UK Readiness Score** — a weighted score showing how settled you are, updated as you complete tasks
- **Task-level guidance** — step-by-step instructions, common mistakes, and official source links for every task
- **Document Helper** — plain-English explanations of official UK documents, with guardrails and safe next steps
- **Nia — The SettleMap Navigator** — AI-assisted guide for orientation questions, transparently disclosed as not a regulated adviser
- **Budget Planner** — income, expenses, and savings tracker with a printable summary
- **NHS Guide** — practical guide to using the NHS, from GP registration to prescriptions
- **Emergency Contacts** — vetted official numbers: 999, 111, 101, Samaritans, and more
- **Mobile-friendly** — works on desktop and mobile

---

## 🎯 Current Focus

**MVP v1.2** is in active development, targeting:
- Profile-led, compliance-safe settlement assistant
- All checklist tasks pointing to official GOV.UK/NHS sources
- Disclaimers and risk warnings on all sensitive content
- Onboarding with full profile collection
- Weighted UK Readiness Score
- Supabase Auth + Postgres schema (draft prepared, backend not yet connected)

See the [Developer Action Prompt](./docs/DEVELOPER_ACTION_PROMPT.md) for full v1.2 scope.

---

## 🛠 Tech Stack

- **Framework:** Next.js 15 (React 19, TypeScript)
- **Styling:** Tailwind CSS 3
- **Charts:** Recharts
- **Icons:** Lucide React
- **Auth:** Cookie-based (client-side mock) — Supabase Auth schema prepared
- **Data:** In-memory (localStorage) for MVP; Supabase Postgres schema drafted
- **Deployment:** Vercel (recommended) or any Node.js host

---

## 📦 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
git clone https://github.com/settlemap/SettleMap.git
cd SettleMap
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
# Supabase (optional — for future backend integration)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Currently the app runs fully client-side without any backend. Supabase integration is on the roadmap for MVP v1.2+.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3456](http://localhost:3456) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## 📁 Project Structure

```
SettleMap/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                 # Landing page
│   ├── onboarding/              # Onboarding wizard
│   ├── dashboard/               # Main dashboard + UK Readiness Score
│   ├── checklist/               # Personalised task checklist
│   ├── budget/                  # Budget planner
│   ├── guides/                  # Guidance articles
│   │   └── [slug]/              # Individual guidance article
│   ├── nhs/                     # NHS guide
│   ├── bank/                    # Banking guide
│   ├── emergency/               # Emergency contacts
│   ├── support/                # Support form
│   ├── settings/               # User preferences
│   ├── admin/                   # Admin dashboard (stubs)
│   │   ├── tasks/               # Task management (stub)
│   │   └── guides/              # Guidance management (stub)
│   └── document-helper/        # Document Helper AI tool
├── components/                  # Reusable UI components
│   ├── Nia.tsx                  # Nia — AI guide (The SettleMap Navigator)
│   ├── Navigation.tsx           # Desktop navigation
│   ├── MobileNav.tsx            # Mobile bottom tab navigation
│   ├── DashboardSkeleton.tsx     # Loading skeleton
│   ├── ChecklistSkeleton.tsx     # Loading skeleton
│   ├── Disclaimer.tsx            # Reusable disclaimer component
│   ├── StepList.tsx             # Step-by-step list component
│   ├── InfoCard.tsx             # Info card component
│   └── ...
├── lib/                         # Business logic + data
│   ├── seed-data.ts             # 40+ settlement tasks
│   ├── guidance-data.ts         # 20 guidance articles
│   ├── readiness-score.ts       # UK Readiness Score calculator
│   ├── stage-calculator.ts      # Stage assignment logic
│   ├── scam-alerts.ts           # Scam alert data
│   └── utils.ts                 # localStorage helpers (safeGet/safeSet)
├── types/                       # TypeScript type definitions
│   └── index.ts                 # All shared types
├── supabase/
│   └── schema.sql               # Supabase Postgres schema (draft)
├── middleware.ts                # Route protection middleware
├── tailwind.config.ts           # Tailwind CSS config
└── package.json
```

---

## 🤖 Nia — The SettleMap Navigator

Nia is SettleMap's AI-assisted orientation guide. She helps users understand their checklist tasks, find official sources, and navigate daily UK life.

**Transparency:** Nia is explicitly disclosed as an AI tool — not a real adviser, not affiliated with any government body, not a substitute for professional advice. See [components/Nia.tsx](./components/Nia.tsx) for full implementation.

Nia is **not** designed to answer:
- Immigration or visa-specific questions (→ direct to UKVI/GOV.UK)
- Legal case-specific guidance (→ direct to a qualified solicitor)
- Financial investment decisions (→ direct to a financial adviser)
- Medical diagnosis or treatment (→ direct to NHS 111 or a GP)

---

## 🔐 Data & Privacy

- **Client-side only (current):** All user data is stored in your browser's `localStorage`. Nothing is sent to a server.
- **No tracking:** SettleMap does not use analytics trackers or third-party tracking.
- **Future backend:** When Supabase is connected, data will be stored in Supabase Postgres with Row Level Security policies.

---

## 🔧 Backend Architecture (Roadmap)

The Supabase schema is drafted in [`supabase/schema.sql`](./supabase/schema.sql). It covers:

| Table | Purpose |
|---|---|
| `profiles` | User profiles (extends Supabase Auth) |
| `user_tasks` | Per-user task completion state |
| `guidance_articles` | Guidance content with review status |
| `support_tickets` | User support requests |
| `reminder_log` | Future reminder scheduling (Resend integration) |
| `admin_guidance_versions` | Version history for guidance content |
| `task_audit_log` | Audit trail for task content changes |

RLS (Row Level Security) is configured on all tables. A service role key is required for admin operations in production.

---

## ⚠️ Disclaimer

SettleMap is an **information and orientation tool only**.

- We are **not** affiliated with the UK Government, GOV.UK, UKVI, NHS, or any official body.
- Nothing on this platform constitutes **immigration advice, legal advice, medical advice, or financial advice**.
- Checklist tasks and guidance articles are based on publicly available official sources and are intended as general information only.
- **You are responsible** for verifying all critical information — especially anything related to immigration status, visa conditions, legal rights, finances, or health — with the relevant official body or a qualified professional.
- For immigration queries: start at [gov.uk/student-visa](https://www.gov.uk/student-visa) or your university's international student support team.
- For emergencies: always call **999** (UK) or go to your nearest A&E.

---

## 📄 License

MIT — SettleMap is an open-source project.

---

Built with care for everyone arriving in the UK. 🇬🇧
