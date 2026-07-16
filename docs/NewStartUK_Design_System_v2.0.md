# NewStart UK — Complete Design System & Brand Guide

> **Version:** 2.0 | **Date:** 30 May 2026  
> **Status:** Design Specification (MVP v1 → Scale)  
> **Based on:** NewStart UK Complete Master Pack v1.2 + 5 Brand Concept Boards

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Complete Design System](#2-complete-design-system)
3. [Information Architecture](#3-information-architecture)
4. [Core Screen Designs](#4-core-screen-designs)
5. [MVP 1 Experience — International Students](#5-mvp-1-experience--international-students)
6. [UX Strategy](#6-ux-strategy)
7. [Visual Direction & Quality Benchmarks](#7-visual-direction--quality-benchmarks)
8. [Future Scalability](#8-future-scalability)

---

## 1. Brand Identity

### 1.1 Brand Personality

NewStart UK is **not** a government portal, a generic startup, or a student game. It occupies a unique position:

| Trait | Expression |
|-------|-----------|
| **Calm** | Soft backgrounds, measured language, non-alarmist warnings. Never panic-inducing. |
| **Practical** | Every screen answers "what do I do next?" Action-oriented, not motivational fluff. |
| **Protective** | Scam alerts are prominent but not fear-mongering. Safety is woven in, not shouted. |
| **Respectful** | Users are adults starting a new life — not children to be coddled or confused. |
| **Plain-English** | No jargon without explanation. If a term needs decoding, decode it inline. |
| **Trust-First** | Disclaimers visible but not overwhelming. Sources cited. AI clearly labelled. |
| **Modern** | Digital-native feel. Rounded cards, clean type, responsive-first. Mobile is primary. |

### 1.2 Brand Values

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   🧭 CLARITY      We translate complexity into confidence    │
│                                                             │
│   🛡️ SAFETY       We protect what matters with care          │
│                                                             │
│   📊 STRUCTURE     We build clear frameworks that turn        │
│                    chaos into progress                       │
│                                                             │
│   💡 GUIDANCE      Expert direction you can rely on           │
│                                                             │
│   📈 MOMENTUM     Small steps today, a better tomorrow       │
│                                                             │
│   🤝 SUPPORT      We're with you—combining technology        │
│                    with human support                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Tone of Voice

**The Nia Voice** — Calm, practical, protective, plain-English.

| Context | ✅ Do | ❌ Don't |
|---------|------|---------|
| Dashboard greeting | *"Welcome back. Here are the next steps that matter most today."* | *"Hey there! Ready to crush your goals? 🚀"* |
| Risk warning | *"Before paying a deposit, check the provider and keep written evidence."* | *"WARNING: SCAM ALERT!! DON'T GET RIPPED OFF!!!"* |
| Completion | *"Good progress. You've completed another important step."* | *"Amazing! You're absolutely killing it superstar!"* |
| Sensitive guidance | *"This is general guidance only. For official advice, use official sources."* | *"Our experts guarantee this will work for you."* |
| Empty state | *"You're up to date for this stage. Review upcoming tasks."* | *"Nothing to see here! Come back later."* |

**Voice Rules:**
- Simple but not childish
- Reassuring but not overpromising
- Warm but not unserious
- Practical and action-oriented
- Culturally sensitive
- Compliance-aware
- **Never** use: "guaranteed," fake urgency, AI hype, complex legal jargon, exclamation-mark overload

### 1.4 Logo Concepts & Rationale

From the 5 concept boards provided, the recommended direction synthesises the strongest elements:

#### Recommended Primary Logo Direction: **Concept Board 1 + Concept Board 4 Fusion**

**Why these two:**

| Element | From Board | Rationale |
|---------|-----------|-----------|
| Compass/Navigation star | Board 1 | Directly encodes "guidance" and "navigation" — core product metaphor |
| Clean wordmark "NewStart" + "UK" superscript | Board 1 | Professional, scalable, works at any size |
| Tagline: "Guiding you forward. Building futures." | Board 1 | Aspirational but grounded |
| Checkmark integration | Board 4 | Encodes "completion" and "done" — core interaction pattern |
| AI-assisted positioning | Board 4 | Future-proof; signals intelligence without gimmickry |

**Logo Mark Construction:**
- A stylised compass rose merged with a subtle forward arrow / path line
- The compass needle forms a faint checkmark shape when viewed holistically
- Geometric, single-weight stroke (2–3px), no fills in monochrome version
- Works at 16px favicon, 40px nav, 200px landing hero

**Logo Lockups:**
```
┌──────────────────────────────────┐  ┌──────────────────────────┐
│  [★] NewStartᵁᴷ                 │  │  [★]                      │
│     Guiding you forward.         │  │  NewStartᵁᴷ               │
│                                  │  │                          │
│  PRIMARY (Horizontal)            │  │  STACKED (Vertical)       │
└──────────────────────────────────┘  └──────────────────────────┘

┌──────────────────────────────────┐
│  [★]                             │
│  NEWSTART UK                     │
│  ─────────────────               │
│  Guiding you forward. Building   │
│  futures.                        │
│                                  │
│  FORMAL (Lockup with tagline)    │
└──────────────────────────────────┘
```

**Secondary / App Icon:**
- Rounded square (squircle) container
- Compass star centred on deep navy background
- Subtle gradient from navy to teal at edges
- Works as PWA icon, favicon, social avatar

**Nia Avatar (AI Persona):**
- Friendly, rounded robot/assistant character
- Soft blue-white colour palette
- Subtle compass/star motif on chest or head
- Clearly labelled as AI — never deceptive
- Expression: calm, attentive, slightly warm

### 1.5 Colour Palette

This is the **definitive colour system**, synthesised from the spec (Doc 10) and the best elements across all 5 concept boards.

#### Primary Palette

| Token | Name | Hex | RGB | Usage |
|-------|------|-----|-----|-------|
| `--color-primary` | **Teal** | `#0B7285` | 11,114,133 | Primary buttons, active states, links, interactive highlights |
| `--color-primary-dark` | **Deep Navy** | `#102A43` | 16,42,67 | Headings, navbar, trust anchors, footer, primary text |
| `--color-primary-light` | **Teal Light** | `#1A4D5E` | 26,77,94 | Hover states, secondary interactive |
| `--color-accent` | **Growth Green** | `#2F9E44` | 47,158,68 | Success states, completion, progress, positive CTAs |
| `--color-warning` | **Careful Amber** | `#F08C00` | 240,140,0 | Caution cards, warning alerts, attention-needed badges |
| `--color-danger` | **Alert Red** | `#C92A2A` | 201,42,42 | Serious warnings, error states, scam alerts, destructive actions |

#### Neutral / Surface Palette

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-background` | **Page Background** | `#F8FAFC` | App background, page base |
| `--color-card` | **Card Surface** | `#FFFFFF` | Cards, panels, modals, inputs |
| `--color-border` | **Border / Divider** | `#D9E2EC` | Card borders, dividers, input borders |
| `--color-muted` | **Muted Text** | `#627D98` | Secondary text, placeholders, hints |
| `--color-civic-50` | **Tinted Background** | `#EFF4FA` | Subtle section backgrounds, code blocks, disclaimer boxes |
| `--color-civic-100` | **Light Border** | `#D9E2EC` | Alternate border shade |
| `--color-civic-200` | **Medium Neutral** | `#B0C0D0` | Disabled states, subtle dividers |
| `--color-civic-600` | **Dark Muted** | `#486581` | Body text alternatives |
| `--color-civic-700` | **Dark Navy** | `#334E68` | Emphasised body text |

#### Semantic / Functional Colours

| Purpose | Colour | Hex | When to Use |
|---------|--------|-----|-------------|
| Success / Complete | Green | `#2F9E44` | Task done, score high, confirmation |
| In Progress | Teal | `#0B7285` | Active task, current stage |
| Pending / Upcoming | Muted | `#627D98` | Future tasks, scheduled items |
| Urgent / Overdue | Amber | `#F08C00` | Past-due tasks, action needed |
| Error / Blocked | Red | `#C92A2A` | Form errors, scam alerts, critical issues |
| Info / Neutral | Blue | `#2563EB` | Informational tips, external links |
| AI / Nia Accent | Soft Violet | `#8B5CF6` | Nia avatar, AI-powered features, suggestions |

#### Gradient Definitions

```css
/* Hero / Brand Gradient */
--gradient-brand: linear-gradient(135deg, #102A43 0%, #0B7285 100%);

/* Success / Completion */
--gradient-success: linear-gradient(135deg, #2F9E44 0%, #37B24D 100%);

/* Card Hover Glow */
--glow-teal: 0 4px 12px rgba(11, 114, 133, 0.08);

/* Nia / AI Gradient */
--gradient-nia: linear-gradient(135deg, #818CF8 0%, #A78BFA 100%);
```

#### Colour Usage Rules

1. **Teal (`#0B7285`)** is the dominant brand colour — use it for primary actions and active states. Never overuse.
2. **Navy (`#102A43`)** carries trust and authority — use for headings, navbar, footer. It grounds the interface.
3. **Green (`#2F9E44`)** means "done" or "good" — reserve strictly for success/completion semantics.
4. **Amber (`#F08C00`)** means "pay attention" — not danger, not neutral. Use sparingly or it loses meaning.
5. **Red (`#C92A2A`)** means "stop" or "danger" — reserve for scams, errors, critical warnings only.
6. **Background is always near-white (`#F8FAFC`)** — never pure white (harsh) or coloured (distracting).
7. **Cards are pure white (`#FFFFFF`)** on the tinted background — creates natural layering.
8. **Never convey information by colour alone** — always pair with icons, text labels, or patterns.

### 1.6 Typography System

#### Font Stack

| Role | Font | Fallback | Weight | Source |
|------|------|----------|--------|--------|
| **Display / Headings** | **Inter** | system-ui, -apple-system, sans-serif | 700, 600 | Google Fonts (free) |
| **Body / UI** | **Inter** | system-ui, -apple-system, sans-serif | 400, 500, 600 | Google Fonts |
| **Code / Data** | **JetBrains Mono** | 'Courier New', monospace | 400 | Google Fonts (optional) |
| **Brand Wordmark** | Custom / Inter Bold | — | 700 | Logo lockup |

> **Rationale:** Inter is the choice of Linear, Notion, Vercel, and countless modern SaaS products. It's exceptionally readable at small sizes, has excellent tabular figures, and feels professional without being corporate-stiff. Using one font family for everything ensures visual cohesion and faster loading.

#### Type Scale (Mobile-First)

| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| **Display** | 2rem (32px) | 700 | 1.2 | -0.02em | Landing hero, dashboard welcome name |
| **H1** | 1.5rem (24px) | 700 | 1.25 | -0.01em | Page titles |
| **H2** | 1.25rem (20px) | 600 | 1.3 | -0.01em | Section headings, card titles |
| **H3** | 1.125rem (18px) | 600 | 1.35 | 0 | Subsection headings |
| **Body Large** | 1rem (16px) | 400 | 1.6 | 0 | Lead paragraphs, task descriptions |
| **Body** | 0.9375rem (15px) | 400 | 1.6 | 0 | Default body text, guidance content |
| **Body Small** | 0.875rem (14px) | 400 | 1.5 | 0 | Secondary text, form labels, card meta |
| **Caption** | 0.75rem (12px) | 500 | 1.4 | 0.02em | Badges, timestamps, hints, disclaimers |
| **Overline** | 0.6875rem (11px) | 600 | 1.3 | 0.06em | Section labels, category tags, nav items |

#### Typography Rules

- **Max line length:** ~70 characters for body text (use `max-width: 65ch`)
- **Paragraph spacing:** 1.5× font size between paragraphs
- **Never use text below 12px** for readable content (11px only for labels/badges)
- **Headings always in Navy (`#102A43`)** — never in teal or grey
- **Links in Teal (`#0B7285`)** with underline on hover only
- **Bold used sparingly** — for emphasis within body, not for entire sentences
- **All caps reserved for overline labels only** — never for body text or headings

### 1.7 Iconography Style

**System:** Lucide React (already in dependencies) + custom brand icons

| Property | Specification |
|----------|--------------|
| **Style** | Outlined, 1.5px–2px stroke, rounded caps and joins |
| **Size** | 20px default (16px compact, 24px feature, 32px decorative) |
| **Grid** | 24×24 viewBox, centred |
| **Colour** | Current colour (inherits text colour by default) |
| **Set** | Lucide React primary; custom compass/star/check for brand moments |

**Category → Icon Mapping:**

| Category | Icon | Lucide Name |
|----------|------|-------------|
| Documents | File/text | `FileText` |
| Accommodation | House | `Home` |
| Money / Banking | Wallet/bank | `Landmark` |
| Health | Medical cross | `HeartPulse` |
| University | Graduation cap | `GraduationCap` |
| Work / Career | Briefcase | `Briefcase` |
| Transport | Bus/train | `Bus` |
| Safety | Shield | `ShieldCheck` |
| Local Life | Map pin | `MapPin` |
| Growth | Chart/trend | `TrendingUp` |
| Tasks / Checklist | Check circle | `CheckCircle2` |
| Warnings | Alert triangle | `AlertTriangle` |
| Scams | Danger | `OctagonX` |
| AI / Nia | Sparkle/bot | `Sparkles` |
| Navigation | Compass | `Compass` (custom) |
| Settings | Gear | `Settings` |
| Profile | User | `User` |
| Notifications | Bell | `Bell` |

**Icon Usage Rules:**
- Icons always paired with text labels (never icon-only for navigation items)
- Icons are supporting, not decorative — they must add meaning
- Consistent sizing within a group (don't mix 16px and 24px in the same list)
- Animated icons reserved for empty states and onboarding only

### 1.8 Illustration & Imagaging Guidelines

**Style Direction:** Abstract, geometric, calming — inspired by Linear's illustrations and Notion's empty states.

| Attribute | Rule |
|-----------|------|
| **Technique** | Vector-based SVG illustrations, flat with subtle gradients |
| **Colour palette** | Brand colours only (teal, navy, green, muted tones) |
| **Subjects** | Paths/journeys, compasses, doors/openings, growth metaphors, maps |
| **Mood** | Calm, hopeful, directional — never chaotic or cluttered |
| **Usage points** | Empty states, onboarding screens, landing page hero, 404/error pages |
| **Photography** | Real student/lifestyle imagery for landing page social proof only — warm, diverse, authentic |
| **No stock photos** of people shaking hands, pointing at laptops, or giving thumbs-up |

---

## 2. Complete Design System

### 2.1 Design Tokens (CSS Custom Properties)

These are already implemented in `globals.css`. The complete token set:

```css
:root {
  /* === BRAND === */
  --color-primary: #0B7285;
  --color-primary-dark: #102A43;
  --color-primary-light: #1a4d5e;
  --color-accent: #2F9E44;
  --color-warning: #F08C00;
  --color-danger: #C92A2A;

  /* === SURFACE === */
  --color-background: #F8FAFC;
  --color-card: #FFFFFF;
  --color-border: #D9E2EC;
  --color-muted: #627D98;
  --color-navy: #102A43;

  /* === CIVIC SCALE === */
  --color-civic-50: #EFF4FA;
  --color-civic-100: #D9E2EC;
  --color-civic-200: #B0C0D0;
  --color-civic-600: #486581;
  --color-civic-700: #334E68;

  /* === SEMANTIC === */
  --color-success: #2F9E44;
  --color-info: #2563EB;
  --color-ai: #8B5CF6;

  /* === SPACING (4px grid) === */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  /* === BORDER RADIUS === */
  --radius-sm: 0.375rem;  /* 6px — inputs, small badges */
  --radius-md: 0.5rem;    /* 8px — buttons, cards */
  --radius-lg: 0.75rem;   /* 12px — panels, modals */
  --radius-xl: 1rem;      /* 16px — feature cards */
  --radius-2xl: 1.25rem;  /* 20px — hero cards, containers */
  --radius-full: 9999px;  /* pills, avatars */

  /* === SHADOWS === */
  --shadow-sm: 0 1px 2px rgba(16, 42, 67, 0.04);
  --shadow-md: 0 4px 6px -1px rgba(16, 42, 67, 0.06), 0 2px 4px -2px rgba(16, 42, 67, 0.04);
  --shadow-lg: 0 10px 15px -3px rgba(16, 42, 67, 0.08), 0 4px 6px -4px rgba(16, 42, 67, 0.04);
  --shadow-glow-teal: 0 4px 12px rgba(11, 114, 133, 0.12);
  --shadow-glow-green: 0 4px 12px rgba(47, 158, 68, 0.15);

  /* === TRANSITIONS === */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;

  /* === Z-INDEX === */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;
}
```

### 2.2 Component Library

---

#### BUTTONS

##### Primary Button

```
┌─────────────────────────────────┐
│   ✓  Get Started          →    │
└─────────────────────────────────┘
```

- **Background:** `#0B7285` (teal)
- **Text:** White, 600 weight, 14px
- **Padding:** 10px 20px (0.625rem 1.25rem)
- **Border-radius:** 10px (`var(--radius-lg)`)
- **Height:** 44px minimum (touch target)
- **Hover:** Darkens to `#095a69`, subtle lift shadow
- **Active:** Scales to 0.98, darker still
- **Disabled:** 50% opacity, cursor not-allowed
- **With icon:** 8px gap between icon and text, icon 18px

**Sizes:**

| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| Small | 36px | 8px 16px | 13px | 16px |
| Default | 44px | 10px 20px | 14px | 18px |
| Large | 52px | 12px 28px | 16px | 20px |

##### Secondary Button (Ghost/Outline)

```
┌─────────────────────────────────┐
│   Explore Guide           →    │
└─────────────────────────────────┘
```

- **Background:** Transparent
- **Border:** 1px solid `#D9E2EC`
- **Text:** `#627D98` (muted)
- **Hover:** Border becomes teal, text becomes teal, `bg-civic-50` fill

##### Tertiary Button (Text)

```
View Guidance →
```

- **No border, no background**
- **Text:** Teal (`#0B7285`), 500 weight
- **Hover:** Underline appears

##### Danger Button

- **Background:** `#C92A2A`
- **Use for:** Delete, remove, report scam — rare actions only

##### Button Groups

When multiple buttons appear together:
- **Primary action** gets the filled teal button
- **Secondary action** gets ghost button
- **Maximum 2 buttons** side by side in mobile view
- **Full-width buttons** on mobile for primary CTAs

---

#### CARDS

##### Standard Card

```
┌──────────────────────────────────────────┐
│                                          │
│   [Icon]  Task Title                     │
│           Short description text that    │
│           explains what this is about.   │
│                                          │
│                              [Badge]  →  │
└──────────────────────────────────────────┘
```

- **Background:** `#FFFFFF`
- **Border:** 1px solid `#D9E2EC`
- **Border-radius:** 16px (`var(--radius-xl)`)
- **Padding:** 20px (1.25rem)
- **Shadow:** None at rest; `--shadow-glow-teal` on hover
- **Hover state:** Border transitions to teal, subtle shadow appears

##### Checklist Task Card

```
┌──────────────────────────────────────────────────────┐
│  ○  Register with a GP                               │
│     D30 · Health · High Priority                     │
│                                                      │
│  ⚠ Don't wait until you're ill to register...       │
│                                          Due in 5d  →│
└──────────────────────────────────────────────────────┘
```

Elements:
- **Left:** Circular checkbox (24px) — unchecked outline, checked fill green
- **Title:** 16px, 600 weight, navy
- **Meta row:** Stage badge + Category dot + Priority badge
- **Risk warning (if present):** Amber-tinted strip with icon, 13px
- **Right:** Chevron or due-date indicator

Card States:

| State | Checkbox | Border | Background |
|-------|----------|--------|------------|
| Not Started | ○ Outline | Default | White |
| In Progress | ◉ Teal fill | Teal tint | `#F0FAFC` |
| Completed | ✓ Green fill | Green tint | `#F0FDF4` |
| Blocked/Issue | ✗ Red outline | Red tint | `#FEF2F2` |
| Urgent/Overdue | ○ Pulse amber | Amber | `#FFFBEB` |

##### Warning / Scam Alert Card

```
┌──────────────────────────────────────────────────────┐
│  ⚠  Housing Scam Warning                            │
│  ─────────────────────────────────────────────────── │
│  Before paying any deposit for accommodation:        │
│  • Never send money without viewing the property     │
│  • Verify the landlord exists independently          │
│  • Keep written evidence of all payments             │
│                                                      │
│  [Report a Scam]                    [Dismiss]        │
└──────────────────────────────────────────────────────┘
```

- **Background:** `#FFFBEB` (amber tint) for warnings, `#FEF2F2` (red tint) for scams
- **Left border:** 3px solid amber or red
- **Icon:** 20px alert icon in matching colour
- **Title:** 16px, 600 weight
- **Body:** 14px, regular
- **Actions:** Ghost buttons only (no heavy CTAs on warning cards)

##### Guidance Card

```
┌──────────────────────────────────────────┐
│  [Gradient accent bar at top]            │
│                                          │
│  How to Register with a GP               │
│  Step-by-step guide to NHS registration  │
│  for international students              │
│                                          │
│  5 min read                [Open]  →     │
└──────────────────────────────────────────┘
```

- **Top accent:** 4px gradient bar (teal → green)
- **Category tag:** Top-left, 11px, pill badge
- **Read time estimate:** Bottom-left, muted caption

##### Info / Stat Card

```
┌──────────────────────┐
│                      │
│       78             │
│   Readiness Score    │
│                      │
│   Good progress      │
│   Keep building      │
│                      │
└──────────────────────┘
```

- **Centered layout**
- **Large number:** 48px, 700 weight, navy (or colour-coded)
- **Label:** 14px, muted
- **Subtext:** 13px, muted, below

---

#### FORMS

##### Text Input

```
┌─────────────────────────────────────────────┐
│  Full Name *                                │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ Enter your full name                   │  │
│  └───────────────────────────────────────┘  │
│  We use this to personalise your experience │
└─────────────────────────────────────────────┘
```

- **Label:** 14px, 600 weight, navy, block display
- **Input:** Full width, 44px height, 8px radius
- **Border:** 1px solid `#D9E2EC`
- **Focus:** Border becomes teal, 3px teal ring at 10% opacity
- **Placeholder:** Muted colour (`#627D98`)
- **Hint text:** 12px, muted, below input
- **Error state:** Red border, red hint text with error icon

##### Select / Dropdown

Same styling as text input, with dropdown chevron icon on right.

##### Radio Group (Onboarding)

```
  What brings you to the UK?
  
  ○ International Student      ← Selected: teal border + fill
  ○ Skilled Worker
  ◉ International Student      ← Default: border only
  
  [Optional helper text under each option]
```

- **Cards-style radio buttons** (not native browser radios)
- **Selected:** Teal left border (3px), light teal background (`#F0FAFC`), teal radio dot
- **Unselected:** White background, standard border
- **Spacing:** 12px between options

##### Toggle / Switch

```
  Email Reminders    ○━━●    ON
```

- **Track:** 44px × 24px, 8px radius
- **Off:** `#D9E2EC` background
- **On:** Teal `#0B7285` background
- **Knob:** 20px white circle with subtle shadow
- **Label:** Left-aligned, 14px, regular

##### Form Validation

| State | Indicator | Behaviour |
|-------|-----------|-----------|
| Pristine | No indicator | Normal appearance |
| Valid | Green check icon (subtle) | Green border tint |
| Error | Red text below + red border | Shake animation, error message |
| Submitting | Spinner in button | Button disabled, loading state |

---

#### TABLES

##### Admin Data Table

```
┌──────┬────────────────────┬──────┬──────┬────────┐
│  ▤   │ Task Title         │Stage │Pri.  │ Actions│
├──────┼────────────────────┼──────┼──────┼────────┤
│ ☐    │ Register with GP   │ D30  │ High │ ✏️ 🗑️  │
│ ☑    │ Set up SIM/eSIM    │ D7   │ Med  │ ✏️ 🗑️  │
│ ☐    │ Open bank account  │ D30  │ V.High│ ✏️ 🗑️ │
└──────┴────────────────────┴──────┴──────┴────────┘
Showing 1–10 of 40 tasks          < 1 2 3 4 >
```

- **Header:** 11px overline, 600 weight, uppercase, muted, sticky top
- **Rows:** 44px min height, bottom border divider
- **Hover:** Row highlight `#F8FAFC`
- **Checkbox column:** 24px fixed width
- **Actions:** Icon buttons only (edit, delete), appear on hover
- **Pagination:** Centered, pill-shaped page numbers
- **Mobile:** Cards stack vertically (table hidden, card list shown instead)

---

#### NAVIGATION PATTERNS

##### Desktop Navbar (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────┐
│ [★] NewStartᵁᴋ    Dashboard   Checklist   Guides   Support  [👤▼] │
└─────────────────────────────────────────────────────────────────────┘
```

- **Height:** 64px
- **Background:** White with subtle bottom shadow
- **Logo:** Left-aligned, links to `/dashboard`
- **Nav items:** Horizontal, 14px, 500 weight, muted colour, teal on active
- **Right:** User avatar dropdown + notification bell
- **Sticky:** Sticks on scroll

##### Mobile Navigation (<1024px)

**Bottom Tab Bar:**

```
┌─────────────────────────────────────────┐
│                                         │
│          (page content)                  │
│                                         │
├──────┬──────┬──────┬──────┬──────┬──────┤
│  🏠  │  ✅  │  📖  │  💬  │  ⚙️  │      │
│ Home │Tasks │Guides|Support│Settings│    │
└──────┴──────┴──────┴──────┴──────┴──────┘
```

- **Height:** 64px + safe area
- **Background:** White with top shadow
- **5 tabs max** (plus optional "More" overflow)
- **Active tab:** Teal icon + label, subtle top indicator
- **Inactive:** Muted grey
- **Safe area:** Respects iOS home indicator / Android navigation bar

##### Sidebar Navigation (Dashboard Area)

For wider screens or admin:

```
┌────────┐
│ [★]    │
│        │
│ Overview│ ← Active: left teal bar + teal text
│ Tasks  │
│ Guides │
│ Docs   │
│ Remind.│
│        │
│ ────── │
│ Settings│
│ Support│
│ Logout │
└────────┘
```

- **Width:** 240px (collapsed: 72px icon-only)
- **Active item:** Light teal background, teal left border 3px
- **Section dividers:** 12px spacer + 1px rule

---

#### PROGRESS INDICATORS

##### Readiness Score Ring

```
        ╭──────╮
       ╱  78   ╱     Score: 78/100
      │  ╱────╱│     Status: Good Progress
       ╲     ╱      Label: Keep Building Momentum
        ╰──────╯
```

- **Size:** 120px diameter (compact: 80px)
- **Stroke:** 8px width
- **Track:** `#D9E2EC` (light)
- **Fill:** Gradient from teal to green based on score
- **Centre:** Large number (28–36px) + label below
- **Animation:** Count-up number on load, smooth arc draw

Score Colour Bands:

| Range | Colour | Label |
|-------|--------|-------|
| 0–25 | Red `#C92A2A` | Just Getting Started |
| 26–50 | Amber `#F08C00` | Making Progress |
| 51–75 | Teal `#0B7285` | Good Progress |
| 76–90 | Green `#2F9E44` | Well Prepared |
| 91–100 | Bright Green `#22C55E` | Settlement Ready |

##### Journey Stage Tracker (Horizontal)

```
  PRE ────── D1 ────── D7 ────── D30 ────── D90 ────── GROW
  ●═════════○──────────○──────────○──────────○
  (current) (upcoming)  (future)   (future)   (future)
```

- **Completed node:** Filled teal circle with white checkmark
- **Current node:** Filled teal circle, pulsing ring animation
- **Upcoming node:** Open circle, teal outline
- **Future node:** Small dot, muted colour
- **Connecting line:** Filled (completed) or dashed (remaining)
- **Labels:** Below each node, 11px overline
- **Mobile:** Horizontally scrollable, snap-to-centre

##### Task Progress Bar (Per Category)

```
  Documents  ████████████████░░░░  80%
  Money      ██████████░░░░░░░░░░  50%
  Health     ██░░░░░░░░░░░░░░░░░░  10%
```

- **Height:** 6px
- **Fill:** Category colour (or teal)
- **Track:** Light grey `#E2E8F0`
- **Label:** Left of bar (category name), right of bar (percentage)
- **Animation:** Width transition on load (300ms ease-out)

---

#### ALERTS & NOTIFICATIONS

##### Inline Alert (Info)

```
┌──────────────────────────────────────────────────┐
│ ℹ  Your arrival date is in 3 days. Make sure     │
│    you have offline copies of your documents.    │
│                                    [Dismiss]  ×  │
└──────────────────────────────────────────────────┘
```

- **Background:** `#EFF4FA` (civic-50)
- **Left border:** 3px solid info colour
- **Icon:** 18px, matching colour
- **Dismiss:** X button, right-aligned

##### Toast Notification (Temporary)

```
┌─────────────────────────────────────┐
│  ✓  Task marked as complete         │
└─────────────────────────────────────┘
```

- **Position:** Top-right (desktop), bottom-centre (mobile, above tab bar)
- **Auto-dismiss:** 3 seconds (success), 5 seconds (info), manual (error)
- **Slide-in from right (desktop) / bottom (mobile)
- **Shadow:** `--shadow-lg`

##### Notification Badge

- **Dot:** 8px circle, red background, white unread count inside
- **Position:** Top-right of bell icon, offset by 4px
- **Count:** Above 9 shows "9+"

---

#### EMPTY STATES

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│                  [Illustration:                       │
│                   calm path /                         │
│                   open door]                          │
│                                                      │
│         All caught up!                                │
│                                                      │
│   You've completed every task for this stage.         │
│   Great work settling in.                             │
│                                                      │
│              [Review Upcoming Tasks]                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Rules:
- **Centered illustration** (SVG, brand-coloured, calming)
- **Headline:** 18px, 600 weight, navy — friendly and human
- **Body:** 14px, muted — explain why it's empty and what to do next
- **Primary CTA:** What the user should do next
- **Never:** Show a blank screen, use error-like imagery, or be passive

Empty State Variants:

| Context | Illustration | Headline | CTA |
|---------|-------------|----------|-----|
| All tasks done | Path reaching destination | All caught up! | Review upcoming |
| No search results | Magnifying glass over map | No results found | Clear filters |
| No notifications yet | Quiet bell | Nothing new | You'll be notified |
| Document helper idle | Document with sparkle | Ready to help | Upload/paste document |
| Offline / error | Disconnected node | Something went wrong | Try again |

---

#### LOADING STATES

##### Skeleton Loader

```
┌────────────────────────────────────────┐
│  ████ ████ ████                        │  ← Title skeleton
│  ████████████████████████████          │  ← Line skeleton
│  ██████████████                        │  ← Short line skeleton |
└────────────────────────────────────────┘
```

- **Shimmer animation:** 1.5s ease-in-out infinite (already in CSS)
- **Colour:** `#D9E2EC` base, `#EFF4FA` shimmer highlight
- **Radius:** Matches actual component being loaded
- **Duration:** Max 2 seconds perceived; show content progressively

##### Page Loading
- **Full-page:** Centred brand logo with subtle pulse animation
- **Content area:** Skeleton cards matching real card layout
- **Button loading:** Spinner replaces icon/text, button disabled

##### Pull to Refresh (Mobile)
- **Spinner above content** (standard mobile pattern)
- **Teal spinner** matching brand colour

---

#### DISCLAIMER COMPONENT

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ℹ  General guidance notice                                 │
│                                                              │
│  NewStart UK provides general settlement guidance, checklist │
│  support, document explanation, and signposting. We do not   │
│  provide legal, immigration, financial, tax, medical, or     │
│  housing advice. For official or regulated matters, please   │
│  use official sources or speak to a qualified professional.  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- **Background:** `#EFF4FA` (civic-50)
- **Border:** 1px solid `#D9E2EC`
- **Radius:** 12px
- **Icon:** Info icon, 16px, civic-600 colour
- **Text:** 12px, civic-600 colour, 1.6 line height
- **Placement:** Bottom of sensitive pages (task detail, guidance, document helper)
- **Collapsible:** Can be collapsed to "ℹ Disclaimer" on return visits

---

### 2.3 Accessibility Standards (WCAG 2.1 AA)

| Requirement | Standard | Our Implementation |
|-------------|----------|--------------------|
| **Colour contrast (normal text)** | ≥ 4.5:1 | Navy on white = 15.6:1 ✅ · Muted on white = 4.97:1 ✅ |
| **Colour contrast (large text)** | ≥ 3:1 | All large text passes ✅ |
| **Colour contrast (UI components)** | 3:1 | Buttons, badges all pass ✅ |
| **Non-colour information** | Don't rely on colour alone | Icons + labels + patterns alongside every colour cue ✅ |
| **Touch targets** | ≥ 44×44px | All interactive elements 44px+ ✅ |
| **Focus indicators** | Visible, 3:1 contrast | 2px teal outline, 2px offset (in CSS) ✅ |
| **Screen reader labels** | Meaningful text | aria-labels on all icons, landmarks on regions ✅ |
| **Motion** | Respect prefers-reduced-motion | Disable animations when flag set ✅ |
| **Text scaling** | Up to 200% | rem-based sizing, no pixel-fixed heights ✅ |
| **Form errors** | Programmatically detectable | aria-invalid, aria-describedby linked ✅ |
| **Link purpose** | Clear from text alone | No "click here" links ✅ |
| **Language** | Declared on `<html>` | lang="en-GB" ✅ |

**Accessibility Testing Checklist:**
- [ ] Keyboard-only navigation through entire app
- [ ] Screen reader test (NVDA / VoiceOver) on all pages
- [ ] Colour blindness simulation (protanopia, deuteropia, tritanopia)
- [ ] 200% zoom test on 1366px viewport
- [ ] Touch test with 44px minimum targets verified
- [ ] Focus order follows visual layout
- [ ] Skip-to-content link present

---

## 3. Information Architecture

### 3.1 Site Map

```
newstartuk.org/
├── /                           Landing Page (public)
├── /signup                     Registration
├── /login                      Authentication
├── /onboarding                 Arrival Profile Setup
│
├── / (Authenticated — Student)
│   ├── /dashboard              Main Dashboard
│   ├── /checklist              Task Checklist & Filters
│   ├── /tasks/[id]             Task Detail
│   ├── /guides                 Guidance Library
│   ├── /guides/[slug]          Guidance Article
│   ├── /document-helper        Document Helper Lite
│   ├── /settings               Profile & Reminder Preferences
│   └── /support                Help & Contact
│
├── /admin                      Admin Dashboard
│   ├── /admin/tasks            Task Template Manager
│   ├── /admin/guides           Guidance Content Manager
│   └── /admin/users            User Overview
│
└── Static / Legal
    ├── /privacy-policy
    ├── /terms-of-use
    └── /cookie-policy
```

### 3.2 User Journeys

#### Primary Journey: New Student Onboarding

```
Landing Page
    │
    ├─→ "Get Started" / Sign Up
    │       │
    │       ▼
    │   Onboarding (5-7 screens)
    │   ┌─────────────────────────────────┐
    │   │ 1. Arrival Type (Student)       │
    │   │ 2. Arrival Status & Date        │
    │   │ 3. City & University            │
    │   │ 4. Accommodation Type           │
    │   │ 5. Optional: Nationality, Work  │
    │   │ 6. Confirmation & Generate      │
    │   └─────────────────────────────────┘
    │       │
    │       ▼
    │   Dashboard (Personalised View)
    │       │
    │       ├──→ Checklist → Task Detail → Mark Done
    │       ├──→ Guides Library → Read Article
    │       ├──→ Document Helper → Get Explanation
    │       ├──→ Settings → Update Profile
    │       └──→ Support → Get Help
    │
    └─→ Waitlist (for pre-launch visitors)
```

#### Dashboard Hierarchy

```
┌────────────────────────────────────────────────────────┐
│  DASHBOARD                                             │
│                                                        │
│  ┌─────────┐  ┌─────────────────────────────────────┐  │
│  │ SCORE   │  │ URGENT & UPCOMING                   │  │
│  │  78     │  │ ● Register with GP     Due in 3d   │  │
│  │ /100    │  │ ● Bank account prep    Due in 5d   │  │
│  │         │  │ ○ Council tax basics  Due in 12d  │  │
│  └─────────┘  └─────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ YOUR PROGRESS                                   │  │
│  │  PRE ●━━━ D1 ●━━━ D7 ●━━━━ D30 ○──── D90 ○     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Tasks        │  │ Guidance     │  │ Alerts     │  │
│  │ 3 of 5 done  │  │ Featured     │  │ Scam warn  │  │
│  │ [Continue] → │  │ [Read] →     │  │ [View] →   │  │
│  └──────────────┘  └──────────────┘  └────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ⚠ SCAM ALERT: Housing deposit fraud             │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 3.3 Navigation Structure

**Information Architecture Principles:**
- **3-click rule:** Any piece of content reachable in ≤3 taps/clicks from dashboard
- **Progressive disclosure:** Show summary first, details on demand
- **Contextual navigation:** Related guidance linked from task detail
- **Breadcrumb awareness:** Always show where user is in their journey
- **Search as fallback:** Full-text search across guides (Phase 2)

### 3.4 Resource Discovery Flow

```
Dashboard
    │
    ├── "I need help with..." intent
    │       │
    │       ▼
    │   Guides Library
    │   ├── Filter by Category (Documents, Money, Health...)
    │   ├── Search by keyword
    │   ├── Sort by relevance / popularity
    │       │
    │       ▼
    │   Guidance Article
    │   ├── Plain English explanation
    │   ├── Related tasks (linked)
    │   ├── Official source links
    │   └── "Ask Nia" for follow-up questions
    │
    └── "What do I do next?" intent
            │
            ▼
        Checklist
        ├── Filtered by current stage
        ├── Sorted by priority / due date
        ├── Shows dependencies
            │
            ▼
        Task Detail
        ├── Step-by-step instructions
        ├── Risk warnings
        ├── Linked guidance article
        └── Mark complete → updates score
```

### 3.5 Settlement Journey Flow

```
PRE (Before Arrival)
  ├─ Confirm enrolment
  ├─ Secure accommodation
  ├─ Prepare documents
  ├─ Plan airport route
  └─ Budget for first month
        │
        ▼
D1 (Arrival Day)
  ├─ Confirm safe arrival
  ├─ Reach accommodation
  ├─ Contact family (optional)
  └─ Rest & recover
        │
        ▼
D7 (First Week)
  ├─ University check-in
  ├─ Set up UK SIM/eSIM
  ├─ Transport pass/discount
  ├─ Orientation events
  └─ First food/shop run
        │
        ▼
D30 (First Month)
  ├─ Bank account setup
  ├─ GP registration
  ├─ Council tax awareness
  ├─ Document organisation
  ├─ Budget review
  └─ Part-time work awareness
        │
        ▼
D90 (Days 31-90)
  ├─ Budget after first month
  ├─ Housing stability check
  ├─ Community connections
  ├─ Career/exploration
  └─ 90-day review
        │
        ▼
GROW (Ongoing)
  ├─ Long-term planning
  ├─ Skill development
  ├─ Financial health
  └─ Community belonging
```

---

## 4. Core Screen Designs

### 4.1 Landing Page

**Goal:** Convert visitor → signup or waitlist. Establish trust immediately.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [★] NewStartᵁᴷ          How it works    About    [Sign Up]│
│                                                             │
│                                                             │
│         Your guide to settling in the UK                    │
│                                                             │
│      Personalised checklists, reminders, and guidance       │
│      for your first 90 days — and beyond.                   │
│                                                             │
│      [Get Started Free →]  [Watch How It Works]             │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  📋 Plan │ │  ✅ Settle│ │  🛡 Protect│ │  🌍 Grow│      │
│  │Prepare   │ │Complete   │ │Avoid      │ │Build     │      │
│  │before    │ │first      │ │mistakes   │ │your life │      │
│  │arrival   │ │steps      │ │& scams    │ │beyond    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  "NewStart made my first month in London so much    │   │
│  │   easier. I knew exactly what to do and when."       │   │
│  │   — Amara O., Masters student, UCL                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  How it works (3-step process illustration)                 │
│                                                             │
│  [Trusted by students at 20+ universities]                  │
│  [Partner logos strip]                                      │
│                                                             │
│  Still have questions? [Contact Us]                         │
│                                                             │
│  ── Footer ──────────────────────────────────────────────   │
│  NewStart UK · Privacy · Terms · © 2026                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**
- **Hero:** Navy-to-teal gradient background or clean white with large navy headline
- **No carousel** — single clear value proposition
- **Social proof** above the fold if possible (trust signal)
- **Two CTAs:** Primary ("Get Started Free") + Secondary ("Watch How It Works")
- **Disclaimer footer** on every page
- **Mobile:** Single column, stacked sections, sticky CTA button

---

### 4.2 Registration & Onboarding

**Sign Up Screen:**

```
┌────────────────────────────────────┐
│                                    │
│       [★] NewStartᵁᴷ              │
│                                    │
│  Create your account               │
│                                    │
│  Start your UK settlement journey  │
│  with a personalised roadmap.      │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Email address               │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  Create password             │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  Confirm password            │  │
│  └──────────────────────────────┘  │
│                                    │
│  ☐ I agree to the Terms and        │
│    Privacy Policy                  │
│                                    │
│  [Create Account →]               │
│                                    │
│  Already have an account?          │
│  [Log in]                          │
│                                    │
└────────────────────────────────────┘
```

**Onboarding Flow (Step-by-Step):**

Each screen follows the same pattern:
- **Progress indicator** at top (dots or steps: ●—○—○—○—○)
- **One question per screen** (or closely related group)
- **Friendly, plain-English question** as heading
- **Helpful subtext** explaining why we ask
- **Clear "Continue" / "Back"** navigation
- **Option to skip** optional fields

**Screen 1: Welcome**
```
┌─────────────────────────────────────┐
│                                     │
│  Hi there! 👋                       │
│                                     │
│  Let's build your personalised       │
│  UK settlement roadmap.             │
│                                     │
│  This takes about 2 minutes.         │
│                                     │
│  [Let's go →]                       │
│                                     │
└─────────────────────────────────────┘
```

**Screen 2: Arrival Type**
```
┌─────────────────────────────────────┐
│  Step 1 of 5    ●○○○○               │
│                                     │
│  What brings you to the UK?         │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🎓  International Student  ●  │  │ ← Selected
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 💼  Skilled Worker          ○  │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 👨‍👩‍👧  Family                ○  │  │
│  └───────────────────────────────┘  │
│                                     │
│  (More coming soon)                  │
│                                     │
│        [Skip]        [Continue →]   │
└─────────────────────────────────────┘
```

**Screen 3-5:** Arrival date/status → City & University → Accommodation  
**Screen 6 (Optional):** Nationality, English level, Work interest  
**Screen 7: Confirmation**
```
┌─────────────────────────────────────┐
│  Step 5 of 5    ●●●●●               │
│                                     │
│  Your roadmap is ready! 🎉          │
│                                     │
│  Based on your profile:             │
│  • Arriving: 15 Sept 2026           │
│  • City: Manchester                │
│  • University: UoM                 │
│  • 38 tasks generated               │
│                                     │
│  [Go to Dashboard →]               │
│                                     │
└─────────────────────────────────────┘
```

---

### 4.3 User Dashboard

**The command centre. One screen to show everything that matters now.**

```
┌──────────────────────────────────────────────────────┐
│  ☰  Dashboard                    🔔 [👤]            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Good morning, Alex!                                 │
│                                                      │
│  ┌──────────┐                                        │
│  │    78     │  Current Stage: D7 — First Week       │
│  │  ╭───╮    │  Next milestone: D30 in 18 days       │
│  │  │ 78│    │                                       │
│  │  ╰───╯    │  [View Full Roadmap →]               │
│  │ Readiness │                                       │
│  └──────────┘                                        │
│                                                      │
│  ── What matters most today ─────────────────────    │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ ○  Complete university check-in    D7 · Uni  │   │
│  │    Due today · High Priority      [Start] → │   │
│  ├──────────────────────────────────────────────┤   │
│  │ ○  Set up UK SIM/eSIM            D7 · Local │   │
│  │    Due in 2 days · Medium         [Start] → │   │
│  ├──────────────────────────────────────────────┤   │
│  │ ●  Prepare bank account docs     D30 · Money │   │
│  │    In progress · Start early      [Continue]│   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ── Your Progress ──────────────────────────────    │
│  PRE ✓ ━━━ D1 ✓ ━━━ D7 ●━━━━ D30 ○ ━━━━ D90 ○    │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Guidance │ │ Documents│ │ Reminders│           │
│  │ Featured │ │ 3 of 5   │ │ Next: GP │           │
│  │ [Read]→  │ │ [Review]→│ │ [View]→  │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ ⚠  Housing Scam Alert                       │   │
│  │    Before paying deposits, verify landlords  │   │
│  │    independently. Keep written evidence.     │   │
│  │                                    [Learn more]│   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
├──────────────────────────────────────────────────────┤
│  🏠    ✅    📖         💬        ⚙️              │
│ Home  Tasks  Guides  Support  Settings              │
└──────────────────────────────────────────────────────┘
```

**Dashboard Layout Rules:**
- **Above fold:** Greeting + Readiness Score + urgent tasks (max 3)
- **Middle:** Stage tracker + quick-access cards
- **Below:** Scam/alert card (if any) + suggested guidance
- **Always show:** Where they are in the journey (stage badge)
- **Personalised greeting:** Uses first name, time-aware ("Good morning/afternoon")

---

### 4.4 90-Day Settlement Plan (Roadmap View)

```
┌──────────────────────────────────────────────────────┐
│  ← Back    Your 90-Day Settlement Plan               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  PRE · Before Arrival              ✓ 5/5 done  │  │
│  │  ████████████████████████████████████  100%    │  │
│  │  ──────────────────────────────────────────── │  │
│  │  ☑ Confirm university enrolment               │  │
│  │  ☑ Confirm accommodation                     │  │
│  │  ☑ Prepare key document copies               │  │
│  │  ☑ Plan airport route                        │  │
│  │  ☑ Budget for first month                    │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  D7 · First Week                 ● 2/4 active  │  │
│  │  ████████████████████░░░░░░░░░░░░░░   50%     │  │
│  │  ──────────────────────────────────────────── │  │
│  │  ☑ Complete university check-in              │  │
│  │  ○ Set up UK SIM/eSIM           Due in 2d   │  │
│  │  ○ Get transport pass           Due in 5d   │  │
│  │  ○ Complete orientation          Due in 7d   │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  D30 · First Month               ○ 0/6 upcoming│  │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%      │  │
│  │  (Opens in 11 days)                          │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ... D90, GROW stages follow same pattern ...        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Features:**
- **Expandable/collapsible stages** (default: expanded for current stage)
- **Stage-level progress bar** with percentage
- **Task count:** "X/Y done" or "Z upcoming"
- **Future stages** shown but visually de-emphasised (lighter opacity)
- **Completed stages** can be collapsed to save space

---

### 4.5 Task Management (Checklist View)

```
┌──────────────────────────────────────────────────────┐
│  ← Back    Checklist                    [⚙ Filters] │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  All Tasks  ↓   All Stages  ↓   All Cats  ↓ │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ── D7 · First Week (2 of 4 done) ────────────     │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ ☑  Complete university check-in              │   │
│  │    University · Completed · May 28           │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ ☑  Collect student ID card                   │   │
│  │    University · Completed · May 29           │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ ○  Set up UK SIM/eSIM                        │   │
│  │    Local Life · Due Jun 1 · Medium           │   │
│  │    ⚠ Compare plans before buying             │   │
│  │                                    [Start] →│   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ ○  Attend orientation events                 │   │
│  │    University · Due Jun 5 · Low              │   │
│  │                                    [Start] →│   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ── D30 · First Month (0 of 6, opens Jun 8) ──     │
│  (collapsed — tap to expand)                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Filter Options:**
- **By Stage:** PRE, D1, D7, D30, D90, GROW
- **By Category:** Documents, Accommodation, Money, Health, University, Work, Safety, Local Life, Growth
- **By Priority:** Very High, High, Medium, Low
- **By Status:** Not Started, In Progress, Completed, All
- **Special:** Urgent Only, Overdue

---

### 4.6 Task Detail Page

```
┌──────────────────────────────────────────────────────┐
│  ← Back    Register with a GP                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  D30 · Health · Very High Priority           │   │
│  │                                              │   │
│  │  Register with a GP near your university     │   │
│  │  or term-time address                        │   │
│  │                                              │   │
│  │  ○ Not Started  ● In Progress  ✓ Complete   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ── Why this matters ──────────────────────────     │
│                                                      │
│  GP registration gives you access to NHS non-       │
│  emergency services, prescriptions, and referrals.  │
│  Without it, you may face long waits or charges     │
│  for basic care. Many universities require proof    │
│  of registration.                                    │
│                                                      │
│  ── What to do ─────────────────────────────────    │
│                                                      │
│  1. Find your local GP surgery via NHS website       │
│  2. Complete the registration form (GMS1)            │
│  3. Provide ID: passport + student status letter    │
│  4. Request a named GP if preferred                  │
│  5. Save your NHS number                             │
│                                                      │
│  ── Common mistakes ──────────────────────────      │
│                                                      │
│  ⚠ Waiting until you're ill before registering      │
│  ⚠ Assuming your home university covers NHS access  │
│  ⚠ Not keeping a copy of your registration form     │
│                                                      │
│  ── Official sources ─────────────────────────      │
│                                                      │
│  📎 NHS: nhs.uk/service-search/find-a-gp            │
│  📎 Gov.uk: gov.uk/register-with-a-gp               │
│  📎 Your university student services page           │
│                                                      │
│  ── Related guidance ─────────────────────────      │
│                                                      │
│  [NHS Basics for International Students] →           │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ ℹ General guidance only. For official advice │   │
│  │ use NHS or gov.uk sources.                    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [✓ Mark as Complete]    [Ask Nia 🤖]    [← Back]  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### 4.7 Resource Hub (Guidance Library)

```
┌──────────────────────────────────────────────────────┐
│  ← Back    Guidance Library                          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Plain-English guides to help you settle in.         │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ 🔍 Search guides...                    [✕]  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Categories                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 📄Doc│ │ 🏠Acc│ │ 💰Mon│ │ ❤Health│ │ 🎓Uni│   │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│  │💼Work│ │🛡Safe│ │📍Local│ │📈Grow│             │
│  └──────┘ └──────┘ └──────┘ └──────┘             │
│                                                      │
│  Popular Guides                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │ ░░ How to Register with a GP                 │   │
│  │    Step-by-step NHS registration guide        │   │
│  │    5 min read · Health                 [→]   │   │
│  ├──────────────────────────────────────────────┤   │
│  │ ░░ Student Bank Account Preparation          │   │
│  │    Documents needed, timing, and safety tips  │   │
│  │    7 min read · Money                 [→]   │   │
│  ├──────────────────────────────────────────────┤   │
│  │ ░░ UK Accommodation: What You Need to Know   │   │
│  │    Tenancy, deposits, contracts explained    │   │
│  │    8 min read · Accommodation          [→]   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  All Guides (20)                             [See all]│
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### 4.8 Student Support Section

Integrated into the dashboard and support page:

```
┌──────────────────────────────────────────────────────┐
│  ← Back    Support                                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  How can we help you today?                          │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────┐         │
│  │ 📋 Checklist Qs  │  │ 📄 Document help │         │
│  │ Questions about  │  │ Confused by a    │         │
│  │ your tasks       │  │ form or letter?  │         │
│  └──────────────────┘  └──────────────────┘         │
│  ┌──────────────────┐  ┌──────────────────┐         │
│  │ 🏠 Housing worry │  │ ⚠ Report a scam  │         │
│  │ Tenancy or       │  │ Suspicious       │         │
│  │ landlord issue?  │  │ activity?        │         │
│  └──────────────────┘  └──────────────────┘         │
│  ┌──────────────────┐  ┌──────────────────┐         │
│  │ 💬 General query │  │ 🐛 Technical     │         │
│  │ Anything else    │  │ Bug or problem   │         │
│  └──────────────────┘  └──────────────────┘         │
│                                                      │
│  ── Or ask Nia ──────────────────────────────       │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  🤖 Nia can help explain things in plain     │   │
│  │  English. Try asking about banking, GP       │   │
│  │  registration, council tax, or documents.    │   │
│  │                                              │   │
│  │  [Chat with Nia]                             │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ── Common topics ────────────────────────────      │
│                                                      │
│  Visa & Immigration · Accommodation · Banking       │
│  GP & Health · Council Tax · Jobs & Work            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### 4.9 Profile & Settings

```
┌──────────────────────────────────────────────────────┐
│  ← Back    Settings                                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ── Your Profile ─────────────────────────────      │
│  ┌──────────────────────────────────────────────┐   │
│  │  👤 Alex Chen                                 │   │
│  │  alex.chen@email.com                          │   │
│  │  [Edit Profile]                               │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Arrival Details                                    │
│  Student · Arrived: 25 May 2026 · Manchester · UoM  │
│  Private rental · [Update]                           │
│                                                      │
│  ── Notifications ────────────────────────────      │
│                                                      │
│  Email Reminders                    [====●] ON      │
│  Receive task reminder emails                     │
│                                                      │
│  Weekly Digest                      [===○] OFF      │
│  Weekly progress summary email                     │
│                                                      │
│  Urgent Alerts                      [====●] ON      │
│  Immediate alerts for overdue tasks                 │
│                                                      │
│  Marketing Emails                    [==○] OFF      │
│  Tips, updates, and new features                   │
│                                                      │
│  ── Account ─────────────────────────────────      │
│  Change Password                                    │
│  Download My Data                                   │
│  Delete Account                                     │
│  Sign Out                                           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### 4.10 Notifications Centre

```
┌──────────────────────────────────────────────────────┐
│  ← Back    Notifications                             │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Today                                              │
│  ┌──────────────────────────────────────────────┐   │
│  │ 📋 Task due: Register with a GP (3 days)    │   │
│  │    2 hours ago                        [→]    │   │
│  ├──────────────────────────────────────────────┤   │
│  │ ✅ Great progress! Your score is now 78      │   │
│  │    5 hours ago                              │   │
│  ├──────────────────────────────────────────────┤   │
│  │ 📖 New guide: Council Tax Student Exemption  │   │
│  │    Yesterday                          [→]    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  This Week                                          │
│  ┌──────────────────────────────────────────────┐   │
│  │ ⚠ Scam alert: Review housing deposit safety  │   │
│  │    3 days ago                         [→]    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [Mark all as read]                                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### 4.11 Help & Support (Covered in 4.8 above)

Support page doubles as help centre. Key addition — **FAQ section:**

```
  ── Frequently Asked Questions ────────────────

  ▸ How is my readiness score calculated?
  ▸ Can I change my arrival date after signing up?
  ▸ Is my data secure?
  ▸ How do I delete my account?
  ▸ Is NewStart UK affiliated with the government?
  ▸ How is Nia different from a human advisor?
```

---

## 5. MVP 1 Experience — International Students

### 5.1 Student-Specific Design Decisions

| Decision | Rationale |
|----------|-----------|
| **University-centric language** | Onboarding asks for uni, city adapts to uni location |
| **Academic calendar awareness** | Tasks align with typical term dates (Sept/Oct arrivals) |
| **Budget-conscious defaults** | Money tasks assume student budget levels |
| **Part-time work awareness** | Optional work interest adds NI/right-to-work tasks |
| **Accommodation focus** | Heavy emphasis on halls vs private rental decision |
| **Social connection cues** | GROW stage includes community/student society tasks |

### 5.2 Arrival Checklist (PRE Stage)

**Student-specific PRE tasks:**

| # | Task | Why It Matters for Students |
|---|------|----------------------------|
| 1 | Confirm university enrolment instructions | Cannot enter UK without CAS clearance |
| 2 | Confirm accommodation & first-night plan | Halls vs private — different preparation |
| 3 | Prepare key document copies (passport, visa, CAS) | Border control requires originals + copies |
| 4 | Plan airport-to-accommodation route | First night in new country — reduce stress |
| 5 | Budget for first month (tuition, rent, food, transport) | Students often underestimate London/UK costs |
| 6 | Download university app & save key contacts | Lost-phone scenario preparation |
| 7 | Inform home bank of travel | Prevent blocked cards abroad |

### 5.3 University Onboarding (D7 Stage)

**Design touch:** University-branded warmth.

- Use the university name throughout (not just "your university")
- Link to university's specific international student office page
- Include "find your student ID" as an explicit early task
- Reference university orientation week schedule

### 5.4 Banking Setup Guidance

**Task flow with extra care:**

```
Bank Account Preparation (D30)
│
├─ Prerequisite: Confirm UK address (from accommodation task)
├─ Prerequisite: Have student status letter
│
├─ Step 1: Understand your options
│   ┌─────────────────────────────────┐
│   │ Account Type    | Best For      │
│   │ ────────────────┼────────────── │
│   │ Student Account │ No monthly fee│
│   │ Basic Account   │ Quick open    │
│   │ Current Account │ Full features │
│   └─────────────────────────────────┘
│
├─ Step 2: Gather documents
│   Passport · Visa/CAS · Proof of address · Student letter
│
├─ Step 3: Choose provider (neutral comparison, no ranking)
│
├─ Step 4: Apply in-person or online
│
└─ ⚠ Risk Warning:
   "Do not pay anyone to open an account for you.
    Banks never charge for account opening."
```

### 5.5 GP Registration Information

**Presented as a gentle timeline, not a wall of text:**

- Best to register within first week of arrival
- Can register before arriving (some surgeries allow pre-registration)
- Need: passport, student proof, address proof
- NHS number arrives by post within 2 weeks
- **Link directly to NHS surgery finder** (external, official source)

### 5.6 Accommodation Resources

**Different guidance paths:**

| Accommodation Type | Specific Guidance |
|-------------------|-------------------|
| University halls | Keys collection, hall rules, what's included |
| Private rental | Deposit protection scheme, inventory, landlord checks |
| Temporary (hotel/hostel) | Transition plan, permanent housing search urgency |
| Family/friend | Mail forwarding, contribution to household bills |

**Scam alert prominently displayed** for private rental path.

### 5.7 Transport Information

- Student railcard (16-25 Railcard) — when to buy, how much it saves
- Bus passes for city (Manchester/Oxford/London specific)
- Airport transfer options from major hubs
- Cycle safety note (if relevant to city)

### 5.8 Essential Services Setup

**Quick-reference card format:**

```
┌─────────────────────────────────────────────┐
│  Essential Services Starter Pack            │
│                                             │
│  ✉ Email: Set up on phone + laptop          │
│  📱 SIM: eSIM or physical SIM from carrier  │
│  🏦 Bank: Student account (see guide)       │
│  🩺 GP: Register locally (see guide)        │
│  📋 Council Tax: Exemption awareness        │
│  🆔 NI Number: If planning part-time work   │
│                                             │
│  [Export this checklist as PDF]             │
└─────────────────────────────────────────────┘
```

---

## 6. UX Strategy

### 6.1 User Engagement Model

**The "Return Loop":**

```
┌─────────────────────────────────────────────────┐
│                                                  │
│   User completes task                            │
│         │                                       │
│         ▼                                       │
│   Instant feedback (score ↑, confetti subtle)   │
│         │                                       │
│         ▼                                       │
│   "What's next?" — surface next urgent task     │
│         │                                       │
│         ▼                                       │
│   Email/nudge reminder (if user leaves)          │
│         │                                       │
│         ▼                                       │
│   User returns → loop continues                 │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Engagement Triggers:**

| Trigger | Mechanism | Timing |
|---------|-----------|--------|
| Task completion | Score update + next task suggestion | Immediate |
| Score milestone | Celebration message at 25/50/75/100 | On threshold cross |
| Stage transition | "You've moved to D7/D30/D90" notification | Automatic |
| Inactivity | "You have 3 overdue tasks" nudge | Day 3 of inactivity |
| New guidance | "New guide relevant to your stage" | Weekly digest |

### 6.2 Progress Tracking Mechanisms

**Multi-layer progress visibility:**

1. **Readiness Score** (macro) — Single number, always visible on dashboard
2. **Stage Progress Bar** (meso) — Where am I in the 90-day journey?
3. **Category Breakdown** (meso) — Which areas need attention?
4. **Task Completion** (micro) — Individual task checkboxes
5. **Streak/Consistency** (gamification-light) — "You've completed tasks 5 days in a row"

**Score Psychology:**
- Start at a reasonable baseline (not zero — demotivating)
- First few tasks should move the score noticeably (reward early effort)
- Diminishing returns as score increases (encourages completionism)
- Never decrease the score (only increase or hold)

### 6.3 Task Completion Experience

**The "Mark Complete" Moment:**

```
Before click:
  ○  Register with a GP

Click happens:
  1. Checkbox animates: ○ → ✓ (green fill, 200ms)
  2. Card background flashes green-tint (#F0FDF4)
  3. Score ring animates upward (+2 points, count-up)
  4. Toast appears: "✓ Task completed. Your readiness score: 78"
  5. Card slides down (or fades) to completed section
  6. Next uncompleted task gets subtle highlight
  7. (If milestone): Gentle confetti burst ( restrained, not distracting)
```

**Undo:** Allow undo for 60 seconds after completion (soft undo, no confirmation dialog).

### 6.4 Retention Strategy

| Tactic | Implementation |
|--------|---------------|
| **Email reminders** | Configurable frequency, stage-relevant content |
| **Weekly digest** | "Your week in review" — tasks done, score change, upcoming |
| **Milestone celebrations** | 25%/50%/75%/100% score milestones with encouraging messages |
| **Stage transitions** | Special "You've reached D30!" message with stage summary |
| **Personalisation** | Use name, university, city throughout |
| **Nia check-ins** | "Hi Alex, you haven't opened the app in 4 days..." |
| **Value-forward content** | Each email/guide should teach something useful |
| **Mobile PWA** | Add-to-homescreen prompt for app-like access |

### 6.5 Personalisation Opportunities

| Data Point | Personalisation Effect |
|------------|----------------------|
| Name | Greeting, emails, Nia conversations |
| University | Uni-specific guidance, term dates, contacts |
| City | Local GP searches, council info, transport |
| Arrival Date | Stage calculation, task timing, urgency |
| Accommodation Type | Tailored housing guidance, scam warnings |
| English Level | Content simplicity adjustment (future) |
| Work Interest | Adds/removes career-related tasks |
| Nationality | Visa-type assumptions, cultural context (future) |
| Task Behaviour | Adaptive ordering, suggest similar tasks first |

### 6.6 Mobile UX Considerations

**Mobile-First Rules:**

| Area | Decision |
|------|----------|
| **Layout** | Single column, full-width cards |
| **Navigation** | Bottom tab bar (5 tabs), hamburger for secondary |
| **Touch targets** | Minimum 44×44px, generous padding |
| **Thumb zones** | Primary actions in lower-half of screen |
| **Scroll** | Vertical only, no horizontal (except stage tracker) |
| **Inputs** | Native pickers for dates/selects, numeric keypad for numbers |
| **Offline** | Cache last-viewed data, show "offline" banner |
| **Performance** | Target < 3s initial load, < 1s transitions |
| **Safe areas** | Respect notch/home indicator (iOS), gesture nav (Android) |
| **PWA** | Service worker, manifest, install prompt |

**Mobile-Specific Patterns:**
- **Pull-to-refresh** on dashboard and checklist
- **Swipe actions** on task cards (left: complete, right: snooze)
- **Bottom sheets** for quick actions (mark done, snooze, view details)
- **Sticky CTA** on task detail (always-visible "Mark Complete")
- **Full-screen** onboarding (no nav bars during profile setup)

---

## 7. Visual Direction & Quality Benchmarks

### 7.1 Reference Products

| Product | What to Borrow | What to Avoid |
|---------|---------------|---------------|
| **Monzo** | Clean card UI, friendly tone, transaction clarity | Don't copy the neon coral accent |
| **Notion** | Minimalist whitespace, subtle gradients, excellent typography | Don't be as blank/minimal — we need more guidance |
| **Linear** | Smooth animations, keyboard-first, refined components | Don't be developer-focused or cold |
| **Airbnb** | Welcoming imagery, trust signals, review system | Don't be cluttered or marketplace-heavy |
| **Stripe** | Premium documentation feel, refined microcopy | Don't be developer-targeted |

### 7.2 Visual Quality Checklist

Every screen must pass:

- [ ] **No orphan elements** — everything aligned to a grid
- [ ] **Consistent spacing** — using the 4px space scale only
- [ ] **Clear hierarchy** — one dominant element per screen
- [ ] **Purposeful colour** — every colour choice justified
- [ ] **Readable text** — contrast, size, line length all checked
- [ **Responsive** — looks good at 375px (iPhone SE), 390px (iPhone 12), 768px (tablet), 1440px (desktop)
- [ **Accessible** — keyboard navigable, screen reader friendly
- [ **Fast** — no unnecessary images, fonts preloaded, skeletons ready
- [ **Trustworthy** — disclaimers where needed, sources cited, no hype

### 7.3 What to Avoid (Anti-Patterns)

❌ Government website aesthetics (dense tables, bureaucratic language)  
❌ Outdated university portal designs (cluttered dashboards, tiny fonts)  
❌ Excessive colours (more than 3-4 colours per screen)  
❌ Cluttered dashboards (too many widgets, no hierarchy)  
❌ Generic template designs (obvious ThemeForest / Canva look)  
❌ Childish illustrations (cartoon characters, excessive emojis)  
❌ AI gimmickry (pulsing "AI POWERED" badges, chatbot obsessions)  
❌ Fear-based marketing (scare tactics, countdown pressure)  
❌ Carousel abuse (auto-rotating heroes, too many testimonials)

---

## 8. Future Scalability

### 8.1 Design System Extensibility

The design system is built to grow. Here's how each future phase maps to existing tokens:

| Future Feature | Design System Addition Needed |
|---------------|------------------------------|
| **AI-powered settlement assistant (Nia full)** | AI chat UI component, conversation bubbles, typing indicator, suggestion chips — all using existing tokens |
| **Housing marketplace** | Listing cards (extend task card), filter sidebar, map view, host profiles — new components, same tokens |
| **Community features** | Feed cards, comment threads, user profiles, messaging — social component set on same foundation |
| **Career & employment support** | CV builder UI, job listing cards, application tracker — extend guidance card system |
| **Premium membership features** | Upgrade prompts (non-intrusive), badge system, feature gates — premium accent colour (`--color-ai` violet) |
| **B2B white-label** | Theming variables at root level, logo swap, colour override capability |
| **Native apps (iOS/Android)** | Same tokens exportable to SwiftUI / Jetpack Compose design kits |

### 8.2 Theming Architecture

```css
/* Future B2B theming support built into tokens */
:root {
  /* Override these for white-label deployments */
  --brand-logo: url('/logo.svg');
  --brand-primary: #0B7285;
  --brand-primary-dark: #102A43;
  --brand-accent: #2F9E44;
  --brand-name: "NewStart UK";
  --brand-tagline: "Guiding you forward.";
}

/* Example: University of Manchester deployment */
[data-theme="uom"] {
  --brand-primary: #2B1159;    /* UoM purple */
  --brand-primary-dark: #1E0D3E;
  --brand-logo: url('/themes/uom/logo.svg');
  --brand-name: "UoM NewStart";
}
```

### 8.3 Component Growth Path

```
Current (MVP v1)          Phase 2                    Phase 3
─────────────────        ─────────                  ─────────
Button variants           Data table (sortable)      Kanban board
Card types (4)            Chart components           Calendar/scheduler
Form inputs               Chat/message bubbles       Video player
Badge/Tag                 File upload zone            Map embed
Skeleton loader           Rating/review stars        Payment flow
Disclaimer box            Notification preferences   Multi-step wizard
Progress ring             Avatar stack               Collaboration cursors
Stage tracker             Feed/card                  Voice input (Nia)
Empty state (5)           Marketplace listing         AR document scanner (?)
Toast notification        Community post              Live translation
```

### 8.4 Scalability Principles

1. **Tokens > Hardcodes** — Every colour, space, and radius is a variable. Change once, update everywhere.
2. **Components > Pages** — Build reusable components, compose them into pages. Never copy-paste a screen.
3. **Mobile-First** — Every new component starts mobile. Desktop enhancement is progressive.
4. **Accessibility-First** — Every new component is accessible by default. Accessibility debt doesn't compound.
5. **Content-Aware** — Components accept content of varying lengths gracefully (truncation, expansion, "show more").
6. **Performance-Budgeted** — Every new component has a JS/CSS budget. No component should slow initial paint.
7. **Documented** — Every component has usage guidelines. No "undocumented magic."

---

## Appendix A: CSS Variable Quick Reference

```css
/* Import this file or reference these tokens in every component */

/* Brand */
--color-primary: #0B7285;
--color-primary-dark: #102A43;
--color-accent: #2F9E44;
--color-warning: #F08C00;
--color-danger: #C92A2A;

/* Surface */
--color-background: #F8FAFC;
--color-card: #FFFFFF;
--color-border: #D9E2EC;
--color-muted: #627D98;

/* Spacing (4px grid) */
--space-1: 4px;  --space-2: 8px;   --space-3: 12px;
--space-4: 16px; --space-5: 20px;  --space-6: 24px;
--space-8: 32px; --space-10: 40px; --space-12: 48px;

/* Radius */
--radius-sm: 6px;  --radius-md: 8px;  --radius-lg: 12px;
--radius-xl: 16px; --radius-2xl: 20px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(16,42,67,.04);
--shadow-md: 0 4px 6px rgba(16,42,67,.06);
--shadow-lg: 0 10px 15px rgba(16,42,67,.08);
```

## Appendix B: Microcopy Reference

| Element | Copy |
|---------|------|
| Dashboard greeting | "Welcome back, {name}. Here's what matters most today." |
| Empty checklist | "You're all caught up! Great work settling in." |
| Task start | "Start" → changes to "In Progress" once clicked |
| Task complete | "Done! Your score just went up." |
| Error generic | "Something went wrong. Please try again." |
| Error network | "Having trouble connecting. Check your internet and try again." |
| Loading | "Loading..." (with skeleton) |
| Save success | "Saved successfully." |
| Delete confirm | "Are you sure? This can't be undone." |
| Scam alert header | "Stay safe" |
| Disclaimer short | "General guidance, not professional advice." |
| Nia intro | "Hi, I'm Nia. I'm here to help you understand things in plain English." |
| CTA primary | "Get Started" / "Continue" / "Mark Complete" |
| CTA secondary | "Learn More" / "View Guidance" / "Save for Later" |
| Onboarding final | "Your roadmap is ready. Let's get you settled." |
| Score label | "UK Readiness Score" |
| Stage label | "Settlement Journey" |

## Appendix C: Screen Inventory Summary

| Screen | Route | Auth | Priority |
|--------|-------|------|----------|
| Landing Page | `/` | Public | P0 |
| Sign Up | `/signup` | Public | P0 |
| Login | `/login` | Public | P0 |
| Onboarding | `/onboarding` | Auth | P0 |
| Dashboard | `/dashboard` | Auth | P0 |
| Checklist | `/checklist` | Auth | P0 |
| Task Detail | `/tasks/[id]` | Auth | P0 |
| Guidance Library | `/guides` | Auth | P0 |
| Guidance Article | `/guides/[slug]` | Auth | P0 |
| Document Helper | `/document-helper` | Auth | P1 |
| Settings | `/settings` | Auth | P1 |
| Support | `/support` | Auth | P1 |
| Notifications | `/notifications` | Auth | P2 |
| Admin Dashboard | `/admin` | Admin | P1 |
| Admin Tasks | `/admin/tasks` | Admin | P1 |
| Admin Guides | `/admin/guides` | Admin | P1 |
| Privacy Policy | `/privacy-policy` | Public | P1 |
| Terms of Use | `/terms-of-use` | Public | P1 |

---

## Appendix D: Brand Concept Synthesis Notes

**Analysis of the 5 provided concept boards:**

| Board | Strengths | Weaknesses | Verdict |
|-------|-----------|------------|---------|
| **Board 1** (Compass/Navy) | Strongest professional feel, best typography, clearest component examples, excellent dashboard mockup, trustworthy | Slightly corporate | ⭐ **Primary direction** — best balance of trust + modernity |
| **Board 2** (Pin-check/Blue) | Clean, good pin metaphor for location/settlement, strong card examples | Generic "settlement platform" tagline, less distinctive | Good secondary reference for iconography |
| **Board 3** (Arch/Door/Teal) | Warmest, most welcoming feel, great student-friendly vibe, lovely illustrations | Risks feeling too casual/"app-y", teal-heavy palette limits seriousness | Best for onboarding/empty state illustration style |
| **Board 4** (Pin-check/Navy+Teal) | Excellent tagline "Settle. Connect. Thrive.", balanced palette, Playfair Display adds sophistication | Serif heading font may not suit UI density | Best tagline candidate, good formal collateral direction |
| **Board 5** (Compass-check/AI/Violet) | Best Nia persona definition, AI positioning well-done, modern "Sora" font, violet accent for differentiation | Violet diverges from established teal/navy, may confuse brand recognition | Best for Nia/AI feature identity, violet reserved for AI features only |

**Final Synthesis:**
- **Visual core:** Board 1 (navy/teal, compass, Inter font, professional components)
- **Tagline:** Board 4's "Settle. Connect. Thrive." or Board 1's "Guiding you forward. Building futures."
- **Illustration style:** Board 3's warm, welcoming vector style (arch/door/path metaphors)
- **Nia/AI identity:** Board 5's persona definition + violet accent for AI features only
- **Iconography:** Board 1's clean outlined icons + Board 2's pin-check metaphor
- **Wordmark:** Board 1's "NewStart" + "UK" superscript (cleanest execution)

---

*End of NewStart UK Design System v2.0*
*Generated: 30 May 2026*
*Based on: Master Pack v1.2 + 5 Brand Concept Boards + Existing Codebase Audit*
