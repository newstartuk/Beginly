# Beginly — Non-Student Settlement Pathways
## Design & Content Specification v2.0
*Date: 2026-07-17 · Status: Ready for Implementation*

---

## 1. Purpose

This document specifies the settlement pathway design for all non-student UK migration routes currently served by Beginly. The existing task library (prefix `STU_`) is student-only. This specification extends the system to properly serve Skilled Workers, Global Talent endorsees, Innovator Founders, Health & Care Workers, Graduate Route holders, and Family/Dependant visa holders.

---

## 2. Routes in Scope

| Route | System Key | Primary Need | Task Prefix |
|---|---|---|---|
| Skilled Worker | `skilled_worker` | Employment continuity, ILR pathway | `SKW_` |
| Global Talent | `global_talent` | Endorsement maintenance, professional evidence | `GTL_` |
| Innovator Founder | `founder` | Company setup, endorsing body obligations | `FND_` |
| Health and Care | `health_care` | Professional registration, clinical continuity | `HCW_` |
| Graduate Route | `graduate` | Employment transition from study, full work rights | `GRD_` |
| Family / Dependant | `family_dependant` | Household coordination, own employment rights | `FAM_` |
| Universal (all routes) | — | GP, NI, banking, emergency, accommodation | `UNI_` |

> **Humanitarian** (`humanitarian`) is in the type system but excluded from this phase pending a dedicated welfare-first design pass.

---

## 3. Core Principle: Routes Are Not Roles

The student system assumed everyone arrives at a university with a CAS letter and needs council tax exemption. Non-students arrive with employer letters, endorsements, company incorporation plans, or as family joiners. The system must not map non-students onto a student template — it must derive tasks entirely from their actual context.

**Key differences from student flow:**

| Factor | Student | Non-Student (most routes) |
|---|---|---|
| Council tax | **Exempt** (claim required) | **Liable from day 1** |
| Work rights | Hour-limited (usually 20h/week term-time) | **Full-time permitted** (most routes) |
| Bank account | Student account | Standard current account |
| University | Central to setup | Irrelevant |
| CAS letter | Required | Does not exist |
| Professional registration | None | Often required before working (HCW) |
| Company formation | Not applicable | Core task (FND) |
| HMRC self-assessment | Rare | Likely (GTL, FND, freelancers) |
| Endorsing body | None | Mandatory ongoing (GTL, FND) |
| ILR pathway awareness | Not relevant | Immediately relevant |

---

## 4. Universal Task Set (UNI_)

These tasks apply to all routes regardless of visa type. They replace nothing in the student system — they are the foundation every route builds on top of.

### Phase: Pre-Arrival
| Task ID | Title | Priority |
|---|---|---|
| `UNI_PRE_001` | Prepare and copy key identity documents | High |
| `UNI_PRE_002` | Get a UK SIM or eSIM sorted before landing | High |
| `UNI_PRE_003` | Confirm UK accommodation for first night | High |
| `UNI_PRE_004` | Save UK emergency contacts | Medium |
| `UNI_PRE_005` | Budget for arrival month (incl. one-off costs) | Medium |

### Phase: Day 1
| Task ID | Title | Priority |
|---|---|---|
| `UNI_D1_001` | Travel safely and clear UK border control | High |
| `UNI_D1_002` | Confirm arrival to employer/sponsor/family | High |
| `UNI_D1_003` | Reach accommodation and check condition | High |

### Phase: Week 1
| Task ID | Title | Priority |
|---|---|---|
| `UNI_W1_001` | Register with an NHS GP | High |
| `UNI_W1_002` | Get a UK phone number active | High |
| `UNI_W1_003` | Open a UK bank account (current account) | High |
| `UNI_W1_004` | Apply for your National Insurance number | High |
| `UNI_W1_005` | Set up mobile banking | Medium |
| `UNI_W1_006` | Know where your nearest pharmacy, hospital A&E are | Medium |

### Phase: Month 1
| Task ID | Title | Priority |
|---|---|---|
| `UNI_M1_001` | Confirm NHS registration complete | High |
| `UNI_M1_002` | Set up a monthly budget | Medium |
| `UNI_M1_003` | Download NHS App | Medium |
| `UNI_M1_004` | Complete accommodation setup — utility bills, tenancy inventory signed | High |
| `UNI_M1_005` | Know where to get mental health support if you need it — adjustment is hard; Samaritans (116 123), Mind, and NHS talking therapies are all free to access | Medium |
| `UNI_M1_006` | Council tax registration — **only shown if housing status (onboarding Step 4) is "private rental" or "own home"** — register with your local council within your first month | High |
| `UNI_M1_007` | Driving licence — **only shown if driving status (onboarding Step 5) confirms they drive** — check if your foreign licence is exchangeable at DVLA (non-EEA nationals have a 12-month window; some countries require a full UK test) | Medium |

### Phase: Month 3+
| Task ID | Title | Priority |
|---|---|---|
| `UNI_M3_001` | Start building a UK credit history — get on the electoral roll (if eligible), open a credit-builder card, and use it lightly; your home-country credit record does not transfer | Medium |
| `UNI_M3_002` | Build a financial buffer — aim for 3 months of living costs in a UK savings account; unexpected costs in a new country are common | Low |

---

## 5. Skilled Worker Pathway (SKW_)

### Context
Arrives with a Certificate of Sponsorship (CoS). Employer is the anchor of their UK life. ILR after 5 years is the default aspiration. May bring family on dependent visas.

### What makes this route different
- Council tax liable from day 1 (no exemption)
- Full employment rights from day 1
- Tied to specific employer initially
- CoS conditions must be met (salary, job title)
- BRP or eVisa contains right-to-work conditions
- May need to bring family members later

### Task Set

#### Pre-Arrival
| Task ID | Title | Priority |
|---|---|---|
| `SKW_PRE_001` | Confirm Certificate of Sponsorship details with employer | High |
| `SKW_PRE_002` | Check visa vignette and understand your visa conditions | High |
| `SKW_PRE_003` | Confirm your first day of employment and workplace location | High |
| `SKW_PRE_004` | Arrange accommodation near your workplace | High |
| `SKW_PRE_005` | Understand your salary conditions under your CoS | Medium |

#### Week 1
| Task ID | Title | Priority |
|---|---|---|
| `SKW_W1_001` | Register at your workplace (HR, ID, access) | High |
| `SKW_W1_002` | Provide your right-to-work documents to employer | High |
| `SKW_W1_003` | Confirm PAYE setup with payroll | High |
| `SKW_W1_004` | Confirm eVisa access on UKVI account (or collect BRP if on older format) | High |

#### Month 1
| Task ID | Title | Priority |
|---|---|---|
| `SKW_M1_001` | Check your first payslip for correct tax and NI deductions | High |
| `SKW_M1_002` | Set up utility bills (if in private rental) | Medium |
| `SKW_M1_003` | Understand your leave and sick pay entitlements | Medium |
| `SKW_M1_004` | Begin understanding the ILR 5-year pathway | Medium |
| `SKW_M1_005` | If planning to bring family to the UK later — speak to a solicitor about dependent visa timing, eligibility, and costs | Medium |

#### Month 3+
| Task ID | Title | Priority |
|---|---|---|
| `SKW_M3_001` | ILR pathway calendar — know your qualifying date | Medium |
| `SKW_M3_002` | Review salary against CoS threshold — confirm progression does not breach conditions | Medium |
| `SKW_M3_003` | Explore professional development within your organisation — internal promotions, department moves, or opportunities at other UK branches | Medium |
| `SKW_M3_004` | Plan your first UK annual leave — notify your employer of pre-booked dates; settlement is intensive and rest matters | Medium |
| `SKW_M3_005` | UK pension — confirm auto-enrolment is active on your payslip | Medium |
| `SKW_M3_006` | Review visa conditions — know your renewal window and upcoming salary review dates | High |

### Content to NOT show this route
- CAS letter tasks
- Council tax exemption guide
- Student status letter guide
- University enrolment tasks
- Student bank account guide
- Work hour limit guidance

---

## 6. Global Talent Pathway (GTL_)

### Context
Holds an endorsement from an approved body (UKRI, Tech Nation successor, Arts Council etc.). No employer sponsor. Can work for any employer, be self-employed, or both. Must maintain activity consistent with their endorsement to renew.

### What makes this route different
- No employer anchor — self-directed
- HMRC self-assessment (if self-employed) from the start
- Endorsement conditions must continue to be met
- Evidence logging is a real ongoing obligation
- Can switch employers or go freelance freely
- Professional network is critical

### Task Set

#### Pre-Arrival
| Task ID | Title | Priority |
|---|---|---|
| `GTL_PRE_001` | Confirm endorsement letter and understand its conditions | High |
| `GTL_PRE_002` | Decide: employed, self-employed, or both | High |
| `GTL_PRE_003` | Research your professional base in the UK | Medium |
| `GTL_PRE_004` | Prepare professional portfolio for UK market | Medium |

#### Week 1–2
| Task ID | Title | Priority |
|---|---|---|
| `GTL_W1_001` | If self-employed: register as sole trader with HMRC | High |
| `GTL_W1_002` | Get your Unique Taxpayer Reference (UTR) | High |
| `GTL_W1_003` | Open business bank account (if self-employed) | Medium |
| `GTL_W1_004` | Contact your endorsing body with UK arrival notification | High |

#### Month 1
| Task ID | Title | Priority |
|---|---|---|
| `GTL_M1_001` | Set up a system for recording professional evidence | High |
| `GTL_M1_002` | Join relevant UK professional bodies or associations | Medium |
| `GTL_M1_003` | Understand self-assessment tax return calendar | Medium |
| `GTL_M1_004` | Begin building UK professional network | Medium |
| `GTL_M1_005` | Register for council tax — **only shown if housing status is "private rental" or "own home"** | High |

#### Month 3+
| Task ID | Title | Priority |
|---|---|---|
| `GTL_M3_001` | First professional achievements log entry | High |
| `GTL_M3_002` | Endorsing body annual check-in preparation | Medium |
| `GTL_M3_003` | Visa renewal awareness (check expiry date) | High |
| `GTL_M3_004` | Prepare for first self-assessment tax return — confirm income, expenses, and filing deadline | High |

---

## 7. Innovator Founder Pathway (FND_)

### Context
Has an endorsement from an approved endorsing body. Must demonstrate: innovation, viability, scalability. Business must be genuinely operational. The endorsing body assesses progress at intervals. No employer — entirely self-directed.

### What makes this route different
- Company formation is a day-1 priority
- Business bank account needed immediately
- Both personal and business tax obligations
- Endorsing body has real power — must be kept onside
- Innovation, viability, scalability evidence must be logged continuously
- Hiring staff is a real possibility within 90 days

### Task Set

#### Pre-Arrival / Immediate
| Task ID | Title | Priority |
|---|---|---|
| `FND_PRE_001` | Confirm endorsement and re-read endorsement conditions | High |
| `FND_PRE_002` | Business plan finalised (endorsing body has approved it) | High |
| `FND_PRE_003` | Research Companies House registration requirements | High |
| `FND_PRE_004` | Identify UK accountant or company formation agent | Medium |
| `FND_PRE_005` | Choose registered office address | Medium |

#### Week 1–2
| Task ID | Title | Priority |
|---|---|---|
| `FND_W1_001` | Register your company at Companies House | High |
| `FND_W1_002` | Open a UK business bank account | High |
| `FND_W1_003` | Register for Corporation Tax with HMRC | High |
| `FND_W1_004` | Register for Self-Assessment (as director) | High |
| `FND_W1_005` | Notify endorsing body of company registration | High |

#### Month 1
| Task ID | Title | Priority |
|---|---|---|
| `FND_M1_001` | Register for council tax at your personal address — **only shown if housing status is "private rental" or "own home"** | High |
| `FND_M1_002` | Decide on VAT registration (threshold or voluntary) | Medium |
| `FND_M1_003` | Set up co-working or workspace | Medium |
| `FND_M1_004` | Begin evidence log: innovation, viability, scalability | High |
| `FND_M1_005` | Get professional indemnity / business insurance | Medium |
| `FND_M1_006` | Connect with UK startup ecosystem (incubators, accelerators) | Medium |
| `FND_M1_007` | Director's UTR confirmed | High |

#### Month 3+
| Task ID | Title | Priority |
|---|---|---|
| `FND_M3_001` | Prepare for first endorsing body progress review | High |
| `FND_M3_002` | IP protection review (trademark, patent consideration) | Medium |
| `FND_M3_003` | First Companies House confirmation statement due planning | Medium |
| `FND_M3_004` | Explore SEIS/EIS funding if relevant | Low |
| `FND_M3_005` | Hiring first team member — employment law awareness | Medium |
| `FND_M3_006` | Set up a personal pension (SIPP) — as a company director you are not automatically enrolled; a SIPP gives you tax-efficient retirement savings | Medium |

---

## 8. Health and Care Worker Pathway (HCW_)

### Context
Clinicians and care professionals. Many arrive with professional registration in progress (NMC, GMC, HCPC). Cannot legally practice until registration is complete. Some need OSCE/PLAB/CBT exams. NHS provides structured onboarding.

### What makes this route different
- Professional registration (NMC/GMC/HCPC) is a hard gate before practice
- Employer is typically NHS Trust or private healthcare
- DBS check required before starting
- Occupational health clearance required
- NHS pension auto-enrolment
- Mandatory training from day 1
- Revalidation/CPD is an ongoing obligation
- Pay banding disputes are common — must understand Agenda for Change (NHS)

### Task Set

#### Pre-Arrival
| Task ID | Title | Priority |
|---|---|---|
| `HCW_PRE_001` | Confirm NMC / GMC / HCPC registration application status | High |
| `HCW_PRE_002` | Complete OSCE / PLAB / CBT preparation if required | High |
| `HCW_PRE_003` | Confirm employer's right-to-work process | High |
| `HCW_PRE_004` | Understand DBS check requirement and timeline | High |
| `HCW_PRE_005` | Confirm your pay banding under Agenda for Change | Medium |

#### Week 1–2
| Task ID | Title | Priority |
|---|---|---|
| `HCW_W1_001` | Complete employer HR registration | High |
| `HCW_W1_002` | Submit DBS check application | High |
| `HCW_W1_003` | Complete occupational health clearance | High |
| `HCW_W1_004` | Confirm professional registration number with employer | High |
| `HCW_W1_005` | Begin mandatory training modules | High |
| `HCW_W1_006` | Confirm NHS payroll setup | High |

#### Month 1
| Task ID | Title | Priority |
|---|---|---|
| `HCW_M1_001` | Professional registration fully confirmed | High |
| `HCW_M1_002` | Enrol in NHS pension (auto-enrolment) | Medium |
| `HCW_M1_003` | Understand revalidation / CPD obligations | Medium |
| `HCW_M1_004` | Identify clinical supervisor or preceptor | Medium |
| `HCW_M1_005` | Check pay banding on first payslip | High |
| `HCW_M1_006` | Register for council tax — **only shown if housing status is "private rental" or "own home"** | High |

#### Month 3+
| Task ID | Title | Priority |
|---|---|---|
| `HCW_M3_001` | First formal preceptorship or clinical supervision session reviewed | Medium |
| `HCW_M3_002` | Revalidation date confirmed and logged | Medium |
| `HCW_M3_003` | Professional development plan agreed with line manager or clinical lead | Medium |
| `HCW_M3_004` | Check your visa expiry date — Health & Care visas are typically 3 years; plan your renewal well before expiry to protect your ILR qualifying period | High |

---

## 9. Graduate Route Pathway (GRD_)

### Context
Switched from student visa after completing a qualifying UK degree. Full work rights — no employer sponsor needed, no hour limits. Has 2 years (3 for PhD) to find sponsored employment. Most are already in the UK.

### What makes this route different
- Usually already in UK — transition tasks, not arrival tasks
- Council tax exemption ENDS — now liable
- Student bank account should be upgraded to current account
- University access ends — admin support gone
- Work rights fully unlocked but route has expiry
- Finding a Skilled Worker sponsor is the long-term objective
- Professional identity shift: student → professional

### Task Set (Switching Tasks — Most Users Already in UK)

#### Transition Phase
| Task ID | Title | Priority |
|---|---|---|
| `GRD_T001` | Confirm Graduate Route visa has been granted | High |
| `GRD_T002` | Understand your visa expiry date (2 or 3 years) | High |
| `GRD_T003` | Register for council tax — student exemption no longer applies | High |
| `GRD_T004` | Upgrade or switch from student bank account to current account | Medium |
| `GRD_T005` | Update your NI number status if you did not have one | Medium |
| `GRD_T006` | Remove university email from all professional profiles and accounts | Medium |

#### Month 1 (Professional Setup)
| Task ID | Title | Priority |
|---|---|---|
| `GRD_M1_001` | Update CV for UK professional market | High |
| `GRD_M1_002` | Activate LinkedIn for job search and professional visibility | High |
| `GRD_M1_003` | Research target employers offering Skilled Worker sponsorship | High |
| `GRD_M1_004` | Understand salary benchmarks for your field | Medium |
| `GRD_M1_005` | Identify skills gaps blocking sponsorship eligibility for your target roles | Medium |
| `GRD_M1_006` | If doing freelance or contract work while job-hunting — register as a sole trader with HMRC and obtain a UTR (Graduate Route permits self-employment) | Medium |

#### Month 3+
| Task ID | Title | Priority |
|---|---|---|
| `GRD_M3_001` | Build and maintain your target sponsored roles pipeline | High |
| `GRD_M3_002` | Submit your first batch of applications to employers with a Skilled Worker sponsorship licence | High |
| `GRD_M3_003` | Interview preparation | Medium |
| `GRD_M3_004` | Know your options — if the sponsor search takes time, paths available to you include self-employment, contracting, further study, or Global Talent endorsement (information only; not a recommendation) | Low |

---

## 10. Family / Dependant Pathway (FAM_)

### Context
Joining a UK-based sponsor (partner, parent, or sibling in limited cases). May have independent work rights. May be arriving at any life stage — young professional, parent, or child. Family coordination is the primary need.

### What makes this route different
- Not here for work or study primarily — household is the unit
- Work rights depend on visa type (partner of Skilled Worker: full rights; some dependants: restricted)
- Children's school enrolment is a first-week priority
- Medical registration for all family members
- Household bills in sponsor's or both names
- Individual sense of purpose beyond the sponsor's career

### Task Set

#### Pre-Arrival
| Task ID | Title | Priority |
|---|---|---|
| `FAM_PRE_001` | Confirm visa conditions — can you work? What restrictions? | High |
| `FAM_PRE_002` | Research schools for children (only shown if children confirmed in Step 5d, aged 5–15) | High |
| `FAM_PRE_003` | Coordinate household arrival with sponsor | High |
| `FAM_PRE_004` | Understand UK childcare options if needed | Medium |

#### Week 1
| Task ID | Title | Priority |
|---|---|---|
| `FAM_W1_001` | Register all family members with NHS GP | High |
| `FAM_W1_002` | Contact local council to enrol children in school (only shown if children confirmed in Step 5d, aged 5–15) | High |
| `FAM_W1_003` | Open your own personal bank account | Medium |
| `FAM_W1_004` | Apply for your National Insurance number | High |
| `FAM_W1_005` | Get your own UK phone number / SIM | Medium |
| `FAM_W1_NURSERY` | Research free childcare hours and find registered nurseries near you — UK government provides 15h/week free from age 3 (universal) and expanded entitlement from 9 months for working parents; search "find free childcare" on GOV.UK (only shown if any child is under 5, confirmed in Step 5d) | High |

#### Month 1
| Task ID | Title | Priority |
|---|---|---|
| `FAM_M1_001` | Children confirmed settled in school (only shown if children confirmed in Step 5d, aged 5–15) | High |
| `FAM_M1_002` | Begin job search if eligible to work | Medium |
| `FAM_M1_003` | Find local community and social connections | Medium |
| `FAM_M1_004` | Register for child benefit if applicable | Medium |
| `FAM_M1_005` | Household budget review | Medium |

---

## 11. Content Audit — What to Keep, Update, Replace

### Keep Without Change (Universal Safety & Emergency)
- `housing-scam-warning` — universal
- `job-scam-warning` — universal  
- `emergency-contacts` — update to remove student-specific contacts
- `deposit-protection` — universal
- `tenancy-documents` — universal
- `how-to-register-with-a-gp` — universal, remove "as a student" framing
- `nhs-basics` — universal, remove "you paid IHS as a student" framing

### Update Framing (Remove Student References)
- `first-24-hours` — remove CAS reference, make universal arrival guide
- `uk-accommodation-guide` — remove "as a student" throughout
- `ni-number-basics` — already fairly universal, minor update
- `uk-transport-guide` — remove 16-25 railcard as primary; add it as conditional
- `first-month-budget` — split into student vs professional budget versions
- `90-day-review` — make universal, keep structure

### Replace or Supplement (Student-Only Content)
| Current Article | Replacement |
|---|---|
| `before-you-arrive` (student-framed) | Route-specific pre-arrival guides per route |
| `student-bank-account-prep` | `uk-bank-account-guide` (current account, not student) |
| `council-tax-student-exemption` | `council-tax-for-workers` — you are liable |
| `student-status-letter` | Route-specific: CoS guide, endorsement letter guide |
| `part-time-work-awareness` (student hour limits) | `work-rights-by-route` — full rights for most |
| `right-to-work-share-code` | Update: employer checks for skilled workers, self-employment for GTL/FND |

### New Articles Needed
| Article ID | Title | Routes |
|---|---|---|
| `skilled-worker-cos-guide` | Understanding your Certificate of Sponsorship | SKW |
| `global-talent-endorsement-guide` | Your Global Talent endorsement — what it means and requires | GTL |
| `company-formation-uk` | Registering a company in the UK — step by step | FND |
| `self-assessment-for-newcomers` | HMRC self-assessment for international newcomers | GTL, FND |
| `professional-registration-uk` | NMC, GMC and HCPC registration for health workers | HCW |
| `ilr-pathway-awareness` | Understanding the route to Indefinite Leave to Remain | All non-student routes |
| `council-tax-for-workers` | Council tax — what workers and families need to know | All non-student |
| `uk-bank-account-guide` | Opening a UK bank account (non-student) | All |
| `graduate-route-transition` | Switching from Student to Graduate Route | GRD |

---

## 12. Onboarding Redesign

### Current (Student-Centric) Flow
1. Name, email, password
2. When are you arriving?
3. Which university?
4. Where are you staying? (university halls / private)
5. Arrival date
6. Nationality / English level
7. Interested in work? (yes/no)

### Required (Route-First) Flow

**Step 1: Route selection**
> "What brings you to the UK?"
- I have a job offer or sponsorship → `skilled_worker`
- I have a Global Talent endorsement → `global_talent`
- I'm starting or running a business → `founder`
- I work in health or social care → `health_care`
- I graduated and switched to the Graduate Route → `graduate`
- I'm joining a partner or family member → `family_dependant`
- I'm a student → `student` (existing flow)

**Step 2: Arrival status**
> "Have you already arrived in the UK?"
- Yes, I'm here
- No, I arrive in the next 30 days
- I've been here for more than a month

**Step 3: Location**
> "Which city or area are you based in?"
(Free text, or city picker — used for local opportunity matching)

**Step 4: Housing situation** *(NEW — determines council tax task activation)*
> "What is your current housing arrangement?"
- I am renting privately (house, flat, or room) → **council tax liable** — task activated
- I own my home → **council tax liable** — task activated
- I am living with family or friends → not liable — council tax task suppressed
- My employer or company provides my accommodation → not liable — council tax task suppressed
- I am in an Airbnb or short-term let for now → not liable — council tax task suppressed; a follow-up task at Month 1 prompts them to update housing status if they move into a private rental

*Note: Council tax tasks appear in Month 1 for liable users — not Week 1 — giving people time to settle before administrative obligations stack up.*

**Step 5: Driving** *(NEW — determines driving licence conversion task)*
> "Do you drive?"
- Yes, I drive in my home country
- No, I don't drive
- No, but I'd like to learn in the UK

*If "Yes, I drive":*
> "Do you hold an International Driving Permit (IDP)?"
- Yes
- No, I drive on my national licence only

→ If yes or no (either way): task activated — *"Check if your foreign driving licence is exchangeable at DVLA — non-EEA nationals have a 12-month window to exchange or must sit a UK driving test. Visit GOV.UK/exchange-foreign-driving-licence."*

*If "No, I'd like to learn":*
→ task activated — *"Research UK driving lessons — find a DVSA-approved instructor near you and book a provisional licence via GOV.UK/apply-first-provisional-driving-licence."*

*If "No, I don't drive":* no driving task shown.

**Step 6: Dependants** *(was Step 4)*

This is a multi-step conditional question. It must be placed during onboarding (before tasks are generated) because the answers determine which tasks are active from Day 1.

---

**Step 6a:** "Do you have any dependants with you in the UK, or joining you?"
> [ Yes ] [ No — just me ]

---

**Step 6b (if Yes):** "How many dependants do you have?"
> [ 1 ] [ 2 ] [ 3 or more ]

---

**Step 6c — Relationship (if 1 dependant):** Dropdown — select one:
- Spouse / Civil Partner
- Partner
- Son
- Daughter
- Parent
- Sibling
- Other *(free-text field appears: "Please describe their relationship to you")*

**Step 6c — Relationship (if 2+ dependants):** Multi-select — select all that apply:
- Spouse / Civil Partner
- Partner
- Son
- Daughter
- Parent
- Sibling
- Other *(free-text field appears for each "Other" selected)*

---

**Step 6d (if Son or Daughter selected):** "How old are your children?" *(multi-select — select all age ranges that apply)*
- Under 2 years
- 2–4 years (pre-school age)
- 5–10 years (primary school age)
- 11–15 years (secondary school age)
- 16–18 years (sixth form / college age)

---

**What this unlocks:**
| Dependant type | Tasks activated |
|---|---|
| Any dependant | FAM household coordination tasks (GP registration for all, NI for working-age dependants) |
| Son or Daughter (any age) | FAM_W1_002 (school / childcare research), FAM_M1_001 (school enrolment) |
| Children under 2 | Childcare search task + UK government free hours information |
| Children aged 2–4 | Nursery finder task + UK gov free childcare (15h/week from age 3, expanded entitlement from 9 months for eligible working parents) |
| Children aged 5–15 | School enrolment task (state school registration process) |
| Children aged 16–18 | Sixth form / college enrolment task |

---

**Nursery & free childcare task (FAM_W1_NURSERY — triggers if any child is under 5):**
> **Research free childcare hours and find local nurseries**
> The UK government provides free early education hours for eligible children. Key entitlements to know:
> - **15 hours/week** for all 3–4 year olds (universal, term-time)
> - **15 hours/week** from 9 months old if both parents work and earn above minimum threshold (expanded provision introduced 2024–25)
> - **30 hours/week** for eligible working parents of 3–4 year olds
> Search "find free childcare" on GOV.UK and use the postcode tool to find registered nurseries and childminders near you.

---

*Note for FAM route users: the dependant question is restructured slightly — "Are any children coming with you as part of your family arrangement?" since FAM users are themselves the dependant joining a sponsor. The partner/spouse option is suppressed for FAM users as their sponsor relationship was established by route selection.*

**Step 7: Priority** *(was Step 5)*
> "What's most urgent for you right now?"
- Sorting out work / employment
- Finding or settling accommodation
- Health and NHS registration
- Understanding my visa conditions
- Setting up financially

**Step 8: Sector** *(was Step 6)*
> "What sector do you work in?"
- Technology & Engineering
- Healthcare & Life Sciences
- Finance & Professional Services
- Creative & Media
- Education & Research
- Legal & Compliance
- Construction & Infrastructure
- Retail & Commerce
- Social Care
- Hospitality & Tourism
- Manufacturing & Supply Chain
- Other

Used to generate sector-specific career development tasks at Month 2–3. This is the data that unlocks the personalised growth phase of the journey.

*Conditionality: Step 8 is skipped for Family/Dependant route users unless they selected "work / employment" as their priority in Step 7. A FAM user who is not seeking work does not have a sector to enter, and should not be asked.*

**Step 9: Company / employer name** *(was Step 7)*
> "What is the name of your company or employer?" (optional)

- For SKW: confirms CoS employer for task personalisation and ILR employer-continuity framing
- For FND: pre-fills the Companies House registration task with the business name
- For HCW: identifies NHS Trust for onboarding task specificity
- For GTL: used in professional context tasks (endorsing body check-in, evidence log)
- Optional — can be completed later from the profile settings page

→ Generates route-appropriate task set from `UNI_` + route-specific tasks + deferred career development tasks (gated on settlement completion)

---

## 13. Career Development & Growth Pathway (CDV_)

### Overview

Settlement comes first. The career growth phase unlocks conditionally — not on a fixed calendar date but when the user's own task completion signals they are ready to move beyond the essentials.

### The Settled Gate

| Gate | Threshold | Typical timing | Routes |
|---|---|---|---|
| Fast unlock | UNI_ ≥ 85% + all Day 1 + Week 1 route tasks done | Month 2 | SKW (employer handles admin) |
| Standard unlock | UNI_ ≥ 70% + route Month 1 tasks ≥ 60% | Month 3 | Most routes |
| Extended unlock | Standard + company registered (FND) or endorsing body check-in done (GTL) | Month 4+ | FND, GTL |

**UI treatment:** Career Development tasks appear greyed out with a "Complete your settlement essentials first" message until the gate opens. Once it opens: a push notification and in-app prompt — *"You're settling in well — your career growth tasks are now ready."* The user is not surprised by a new section appearing without context.

### Universal Career Development Tasks (CDV_UNI_)

| Task ID | Title | Priority |
|---|---|---|
| `CDV_UNI_001` | Build or update your professional profile — LinkedIn is valid across all sectors; also check your sector's primary platform (e.g. ResearchGate, NMC portal, CIPD, RIBA) | High |
| `CDV_UNI_002` | Research current salary benchmarks for your role and region | High |
| `CDV_UNI_003` | Set 3 career goals for your first 12 months in the UK | Medium |
| `CDV_UNI_004` | Find UK peers or mentors in your field | Medium |
| `CDV_UNI_005` | Understand UK workplace culture norms relevant to your sector and role | Medium |
| `CDV_UNI_006` | Schedule a 6-month career review (with line manager if employed; self-review if self-directed) — not shown to FAM users unless work intent confirmed | Low |

### How Sector Data Is Used

Only the user's own sector tasks are shown. They stack on top of the universal career tasks.

| Sector | Key tasks | Regulatory/professional body |
|---|---|---|
| Technology & Engineering | GitHub/portfolio, cloud cert (AWS/GCP/Azure), tech community, IR35 if contracting | BCS, IET |
| Healthcare — Clinical (HCW route) | Review CPD log progress, specialist pathway identification, preceptorship completion, bank/agency work awareness | NMC, GMC, HCPC, BMA, RCN |
| Life Sciences — Research & Pharma (GTL/SKW) | ORCiD profile, UKRI grant awareness, publication strategy, research community networking | UKRI, relevant royal society |
| Finance & Professional Services | ACCA/CIMA/CFA/ACA pathway, FCA awareness, ICAEW/CIOT registration | FCA, ICAEW, CIOT |
| Creative & Media | UK portfolio site, commission rates, D&AD/NUJ, Arts Council funding | Equity, NUJ, D&AD |
| Education & Research | ORCiD profile, UKRI grants, QTS (if teaching), UCU union | UCU, UKRI |
| Legal & Compliance | SRA/BSB/CILEX route, CPD 16hr/year, Law Society | SRA, BSB, CILEX |
| Construction & Infrastructure | CSCS card, ICE/IStructE/CIOB/RICS, CEng pathway, CDM regulations | ICE, IStructE, CIOB, RICS |
| Social Care | Care Certificate, CQC awareness, Skills for Care, SWE registration | Skills for Care, CQC |
| Hospitality & Tourism | Hospitality Guild, licensing law, safety qualifications | BIIAB, People 1st |
| Manufacturing & Supply Chain | Lean/Six Sigma, H&S (NEBOSH/IOSH), IMechE/CILT | IMechE, CILT |
| Retail & Commerce | Understand Working Time Regulations and shift rights, retail-specific job platforms (Totaljobs, Reed), customer service qualifications (City & Guilds) | — |

### Route × Career Interactions (CDV_[ROUTE]_)

**SKW — ILR is the career horizon**
- Every career move evaluated against the 5-year ILR clock
- Salary must stay at or above CoS threshold — progression must not fall below it
- Changing employer is possible but requires a new CoS — key task: understand when and how

| Task ID | Title |
|---|---|
| `CDV_SKW_001` | Can you change employer? Understand the rules and timeline |
| `CDV_SKW_002` | Confirm current salary meets or exceeds CoS threshold |
| `CDV_SKW_003` | Add ILR qualifying date to your calendar |

**GTL — Evidence is the career output**
- Every professional achievement is simultaneously career progress and endorsing body evidence
- Speaking, publishing, being cited, winning recognition — these are the proof
- Beginly's evidence log is the tool for documenting this

| Task ID | Title |
|---|---|
| `CDV_GTL_001` | Log first major UK professional achievement in evidence log |
| `CDV_GTL_002` | Book a speaking slot, article, or collaboration opportunity |
| `CDV_GTL_003` | Review endorsement conditions against current professional activity |

**FND — The business is the career**
- Revenue, team, milestones, traction = the career metrics
- The endorsing body's annual review = the performance review
- Innovation / viability / scalability must improve — not just be maintained

| Task ID | Title |
|---|---|
| `CDV_FND_001` | First revenue or pilot customer milestone reached |
| `CDV_FND_002` | Investor deck prepared for endorsing body review |
| `CDV_FND_003` | Begin hiring — employment contract template ready |

**HCW — Revalidation is the career rhythm**
- CPD is not optional — it keeps the licence active
- Career tasks focus on specialist pathway, AfC banding progression, and leadership access

| Task ID | Title |
|---|---|
| `CDV_HCW_001` | Identify your specific specialist pathway with your line manager or clinical lead |
| `CDV_HCW_002` | CPD log reviewed — confirm you are on track for your revalidation cycle |
| `CDV_HCW_003` | AfC pay banding confirmed correct — if disputed, raise formal query with HR |

**GRD — Finding a sponsor is the career goal**
- Time pressure is real — 2 or 3 years and the visa expires
- Career development = active applications to sponsored roles + skills gap closure

| Task ID | Title |
|---|---|
| `CDV_GRD_001` | 10 applications submitted to employers with Skilled Worker sponsorship licence |
| `CDV_GRD_002` | Skills gap identified and course/certification started |
| `CDV_GRD_003` | First interview or offer secured |

**FAM — Career re-entry on your terms**
- May have paused or redirected career to make the move
- Career re-entry is about independent financial identity alongside the sponsor

| Task ID | Title |
|---|---|
| `CDV_FAM_001` | Confirm you are eligible to work — check visa conditions explicitly |
| `CDV_FAM_002` | CV updated for UK job market |
| `CDV_FAM_003` | Childcare or school schedule mapped to enable employment (only shown if children selected in onboarding) |

---

## 14. Implementation Phases

### Phase 1 — Foundation
- Universal task set (`UNI_`)
- Skilled Worker (`SKW_`)
- Graduate Route (`GRD_`)
- Onboarding: 9-step flow — route, arrival status, location, housing situation, driving status, dependants, priority, sector, company name
- Career Development tasks deferred / gated — architecture in place, no content yet

### Phase 2 — Professional Routes + Career Unlock
- Global Talent (`GTL_`)
- Health and Care (`HCW_`)
- New content articles for Phase 2 routes
- Settled Gate mechanism implemented
- Universal career tasks (`CDV_UNI_`) live
- Sector spotlight tasks for: Technology, Healthcare, Finance, Creative, Education, Legal
- Route career tasks for SKW, GTL, HCW, GRD

### Phase 3 — Founder & Family + Full Sector Coverage
- Innovator Founder (`FND_`)
- Family / Dependant (`FAM_`)
- Company formation content
- Family coordination household features
- Remaining sector spotlights: Construction, Social Care, Retail, Manufacturing, Hospitality
- Route career tasks for FND, FAM
- Evidence log feature for GTL and FND

---

## 15. Key Design Principles for Implementation

1. **Route ≠ identity.** Users can change route. Someone on a Graduate visa who gets a job becomes a Skilled Worker. The journey persists; the tasks adapt.

2. **Student content does not show on non-student routes.** No CAS, no university, no council tax exemption, no student bank accounts.

3. **Universal tasks are the floor.** Every route gets `UNI_` tasks. Route tasks stack on top.

4. **Phase labels are route-relative.** "Pre-arrival" means the same for everyone. "Month 1" for Graduate Route means month 1 after switching, not arriving.

5. **Council tax is a real task for all non-students.** It is not hidden or conditional. Workers, founders, global talent, and family members all pay council tax from day 1.

6. **Evidence logging is a first-class feature for GTL and FND.** These users have endorsing body obligations. Beginly should be their evidence trail, not just a checklist.

7. **Family members get individual journeys.** A partner on a dependent visa is not a footnote to their sponsor's journey. They have their own tasks, own bank account, own GP, own NI number.

---

*End of specification. For implementation, start with Phase 1 universal + Skilled Worker tasks and the onboarding route-selection redesign.*
