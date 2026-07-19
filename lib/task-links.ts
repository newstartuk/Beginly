import type { ResourceLink } from "@/types";

const link = (label: string, url: string, kind: ResourceLink["kind"] = "official"): ResourceLink => ({
  label,
  url,
  kind,
});

// ─── Shared link groups ───────────────────────────────────────────────────────

const EVISA_LINKS = [
  link("View and prove your immigration status (eVisa)", "https://www.gov.uk/view-prove-immigration-status"),
  link("Update your UKVI account", "https://www.gov.uk/update-uk-visas-immigration-account-details"),
];

const GP_LINKS = [
  link("Find a GP near you", "https://www.nhs.uk/service-search/find-a-gp"),
  link("How to register with a GP surgery", "https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/"),
];

const NHS_LINKS = [
  link("NHS services near you", "https://www.nhs.uk/nhs-services/"),
  link("NHS App — appointments, prescriptions, records", "https://www.nhs.uk/nhs-app/"),
];

const HEALTHCARE_EXTRAS_LINKS = [
  link("Find a dentist", "https://www.nhs.uk/service-search/find-a-dentist"),
  link("Find an optician", "https://www.nhs.uk/service-search/find-an-optician"),
  link("Find a pharmacy", "https://www.nhs.uk/service-search/pharmacy/find-a-pharmacy"),
];

const PHONE_LINKS = [
  link("Ofcom mobile and broadband checker", "https://checker.ofcom.org.uk/"),
  link("Uswitch SIM-only deals", "https://www.uswitch.com/mobiles/compare/sim_only_deals/", "commercial"),
];

// Bank links — referral links first, then 2 standard options
const BANK_COMPARE = [
  link("Open a Revolut account (recommended)", "https://revolut.com/referral/?referral-code=oluwatxy3u!JUL2-26-AR-H2&geo-redirect", "bank"),
  link("Open a Monzo account (recommended)", "https://join.monzo.com/c/yt7s55w", "bank"),
  link("Open a Lloyds account (recommended)", "https://apply.lloydsbank.co.uk/sales-content/cwa/l/onboardpca/index-app.html?from=ob&webDirect=true&redesign=true&token=+8fMBFcIr+Z5SJnJ1UFIVDIQ5ywwypmQpwK7hym/vGs=&redesign=true#/refer-friend", "bank"),
  link("Starling Bank current account", "https://www.starlingbank.com/current-account/", "bank"),
  link("NatWest current account", "https://www.natwest.com/current-accounts.html", "bank"),
];

// Student-specific bank options (referral links first, then student accounts)
const STUDENT_BANK = [
  link("Open a Revolut account (recommended)", "https://revolut.com/referral/?referral-code=oluwatxy3u!JUL2-26-AR-H2&geo-redirect", "bank"),
  link("Open a Monzo account (recommended)", "https://join.monzo.com/c/yt7s55w", "bank"),
  link("Open a Lloyds student account (recommended)", "https://apply.lloydsbank.co.uk/sales-content/cwa/l/onboardpca/index-app.html?from=ob&webDirect=true&redesign=true&token=+8fMBFcIr+Z5SJnJ1UFIVDIQ5ywwypmQpwK7hym/vGs=&redesign=true#/refer-friend", "bank"),
  link("Santander student account", "https://www.santander.co.uk/personal/current-accounts/123-student-current-account", "bank"),
  link("HSBC student account", "https://www.hsbc.co.uk/current-accounts/products/student/", "bank"),
];

// Business bank accounts (for Global Talent and Founder routes)
const BUSINESS_BANK = [
  link("Open a Revolut Business account", "https://www.revolut.com/business/", "bank"),
  link("Open a Monzo Business account", "https://monzo.com/business/", "bank"),
  link("Starling Business account", "https://www.starlingbank.com/business-account/", "bank"),
  link("Lloyds business banking", "https://www.lloydsbank.com/business/commercial-banking.html", "bank"),
];

// Zero-hour and flexible work platforms (for student, graduate, family visa routes)
const FLEX_WORK_LINKS = [
  link("Indeed Flex — earn by the hour (referral bonus)", "https://indeedflex.onelink.me/4jvh/referafriend", "commercial"),
  link("Tempr — flexible shifts, same-day pay", "https://www.tempr.co.uk/", "commercial"),
  link("Syft — hourly hospitality and retail shifts", "https://www.syftapp.io/", "commercial"),
];

const JOB_SEARCH_LINKS = [
  link("National Careers Service", "https://nationalcareers.service.gov.uk/"),
  link("Indeed UK jobs", "https://uk.indeed.com/", "commercial"),
  link("LinkedIn Jobs", "https://www.linkedin.com/jobs/", "commercial"),
  link("Glassdoor UK", "https://www.glassdoor.co.uk/Job/index.htm", "commercial"),
];

const HOUSING_SEARCH = [
  link("OpenRent", "https://www.openrent.co.uk/", "housing"),
  link("Zoopla rentals", "https://www.zoopla.co.uk/to-rent/", "housing"),
  link("SpareRoom", "https://www.spareroom.co.uk/", "housing"),
  link("Shelter housing advice", "https://england.shelter.org.uk/housing_advice/private_renting", "support"),
];

const COUNCIL_TAX_LINKS = [
  link("Council Tax — who has to pay", "https://www.gov.uk/council-tax/who-has-to-pay"),
  link("Citizens Advice — council tax exemptions", "https://www.citizensadvice.org.uk/housing/council-tax/check-if-you-can-pay-less-council-tax/", "support"),
];

const NI_LINKS = [
  link("Apply for a National Insurance number", "https://www.gov.uk/apply-national-insurance-number"),
  link("National Insurance explained", "https://www.gov.uk/national-insurance"),
];

const BUDGET_LINKS = [
  link("Open your Beginly budget planner", "/budget", "support"),
  link("MoneyHelper budget planner", "https://www.moneyhelper.org.uk/en/everyday-money/budgeting/budget-planner", "support"),
];

const SAVINGS_LINKS = [
  link("MoneyHelper savings guide", "https://www.moneyhelper.org.uk/en/savings/how-to-save/how-to-open-a-savings-account", "support"),
  link("FSCS protection checker", "https://www.fscs.org.uk/check/check-your-money-is-protected/"),
];

const TRANSPORT_LINKS = [
  link("16-25 Railcard", "https://www.16-25railcard.co.uk/", "commercial"),
  link("Student Oyster photocard", "https://tfl.gov.uk/fares/free-and-discounted-travel/18-plus-student-oyster-photocard"),
  link("National Rail railcards", "https://www.nationalrail.co.uk/tickets-railcards-and-offers/railcards/"),
];

const UTILITIES_LINKS = [
  link("Ofgem consumer advice", "https://www.ofgem.gov.uk/information-consumers"),
  link("Citizens Advice energy help", "https://www.citizensadvice.org.uk/consumer/energy/energy-supply/", "support"),
];

const DEPOSIT_LINKS = [
  link("Deposit Protection Service", "https://www.depositprotection.com/"),
  link("Tenancy Deposit Scheme", "https://www.tenancydepositscheme.com/"),
  link("mydeposits", "https://www.mydeposits.co.uk/"),
];

const COMMUNITY_LINKS = [
  link("Students' Union finder (NUS)", "https://www.nus.org.uk/", "support"),
  link("Meetup", "https://www.meetup.com/", "commercial"),
  link("Student Minds", "https://www.studentminds.org.uk/", "support"),
];

const SHOPPING_LINKS = [
  link("Tesco store locator", "https://www.tesco.com/store-locator/", "commercial"),
  link("Sainsbury's store locator", "https://stores.sainsburys.co.uk/", "commercial"),
  link("Aldi store finder", "https://store.aldi.co.uk/", "commercial"),
];

const TENANT_RIGHTS_LINKS = [
  link("Shelter private renting advice", "https://england.shelter.org.uk/housing_advice/private_renting", "support"),
  link("How to rent guide", "https://www.gov.uk/government/publications/how-to-rent"),
];

const WORK_RIGHTS_LINKS = [
  link("Working in the UK while studying", "https://www.ukcisa.org.uk/Information--Advice/Working/Student-work", "support"),
  link("Prove your right to work", "https://www.gov.uk/prove-right-to-work"),
];

const RIGHT_TO_WORK_LINKS = [
  link("Prove your right to work to an employer", "https://www.gov.uk/prove-right-to-work"),
  link("Employer right to work checks", "https://www.gov.uk/check-an-employees-right-to-work-documents"),
];

const NETWORKING_LINKS = [
  link("LinkedIn", "https://www.linkedin.com/", "commercial"),
  link("Prospects careers advice", "https://www.prospects.ac.uk/careers-advice", "commercial"),
  link("TargetJobs internships", "https://targetjobs.co.uk/careers-advice/internships", "commercial"),
];

const MENTAL_HEALTH_LINKS = [
  link("Mind — mental health support", "https://www.mind.org.uk/", "support"),
  link("Samaritans — 24/7 helpline (116 123)", "https://www.samaritans.org/", "support"),
  link("NHS Every Mind Matters", "https://www.nhs.uk/every-mind-matters/"),
];

const CREDIT_LINKS = [
  link("Experian UK — free credit report", "https://www.experian.co.uk/consumer/", "commercial"),
  link("Credit Karma UK — free credit score", "https://www.creditkarma.co.uk/", "commercial"),
  link("MoneySavingExpert — credit score guide", "https://www.moneysavingexpert.com/loans/credit-rating-credit-score/", "support"),
];

const ILR_LINKS = [
  link("Indefinite Leave to Remain (ILR) overview", "https://www.gov.uk/indefinite-leave-to-remain"),
  link("Check ILR eligibility", "https://www.gov.uk/indefinite-leave-to-remain/eligibility"),
];

const SKILLED_WORKER_LINKS = [
  link("Skilled Worker visa overview", "https://www.gov.uk/skilled-worker-visa"),
  link("Skilled Worker visa conditions", "https://www.gov.uk/skilled-worker-visa/when-you-can-start-working"),
];

const PAYE_LINKS = [
  link("Check your income tax for the current year", "https://www.gov.uk/check-income-tax-current-year"),
  link("Tax codes explained", "https://www.gov.uk/tax-codes"),
];

const SELF_EMPLOYED_LINKS = [
  link("Register as self-employed with HMRC", "https://www.gov.uk/set-up-self-employed"),
  link("Self Assessment tax returns", "https://www.gov.uk/self-assessment-tax-returns"),
  link("Find your UTR number", "https://www.gov.uk/find-lost-utr-number"),
];

const ACAS_LINKS = [
  link("Acas — employment contracts", "https://www.acas.org.uk/employment-contracts"),
  link("Acas — holiday entitlement", "https://www.acas.org.uk/annual-leave-and-holiday-pay"),
];

const COMPANIES_HOUSE_LINKS = [
  link("Register a company — Companies House", "https://www.gov.uk/limited-company-formation/register-your-company"),
  link("Companies House — search and update company info", "https://find-and-update.company-information.service.gov.uk/"),
];

const DBS_LINKS = [
  link("Apply for a DBS check", "https://www.gov.uk/request-copy-criminal-record"),
  link("DBS check guidance", "https://www.gov.uk/dbs-check-applicant-criminal-record"),
];

const FAMILY_VISA_LINKS = [
  link("Family visas overview", "https://www.gov.uk/uk-family-visa"),
  link("Skilled Worker — bring your partner and children", "https://www.gov.uk/skilled-worker-visa/bringing-partner-and-children"),
];

const CHILDCARE_LINKS = [
  link("Free childcare — 15 and 30 hours per week", "https://www.gov.uk/help-with-childcare-costs/free-childcare-and-education-for-2-to-4-year-olds"),
  link("Find a childcare provider", "https://www.gov.uk/find-free-early-education"),
];

const PROFESSIONAL_REG_LINKS = [
  link("NMC — Nursing and Midwifery registration", "https://www.nmc.org.uk/registration/"),
  link("GMC — Medical Council registration", "https://www.gmc-uk.org/registration-and-licensing/join-the-register"),
  link("HCPC — Allied Health registration", "https://www.hcpc-uk.org/registration/getting-on-the-register/"),
];

const NHS_CAREER_LINKS = [
  link("NHS Careers", "https://www.healthcareers.nhs.uk/"),
  link("NHS AfC pay scales", "https://www.nhsemployers.org/pay-conditions/national-pay-scales"),
];

const UNIVERSITY_PREP = [
  link("UCAS student advice", "https://www.ucas.com/students", "university"),
  link("UKCISA — preparing and planning", "https://www.ukcisa.org.uk/Information--Advice/Preparing--planning", "support"),
];

const UNIVERSITY_PORTAL = [
  link("UCAS student advice", "https://www.ucas.com/students", "university"),
  link("UKCISA — studying and living in the UK", "https://www.ukcisa.org.uk/Information--Advice/Studying--living-in-the-UK", "support"),
];

// ─── Task link map ─────────────────────────────────────────────────────────────

const TASK_LINKS: Record<string, ResourceLink[]> = {
  // ══════════════════════════════════════════════════════════════════════════
  // UNI_ — Universal (all routes)
  // ══════════════════════════════════════════════════════════════════════════
  UNI_PRE_001: EVISA_LINKS,
  UNI_PRE_002: [
    link("Google Drive — save documents securely", "https://drive.google.com/", "support"),
    link("Dropbox cloud storage", "https://www.dropbox.com/", "support"),
  ],
  UNI_PRE_003: HOUSING_SEARCH,
  UNI_PRE_005: BUDGET_LINKS,
  UNI_PRE_006: [
    link("Apply for a provisional driving licence — DVLA", "https://www.gov.uk/apply-first-provisional-driving-licence"),
    link("Find DVSA approved driving instructors", "https://www.gov.uk/find-driving-schools-and-lessons"),
  ],
  UNI_D1_001: PHONE_LINKS,
  UNI_D1_002: [
    link("WhatsApp", "https://web.whatsapp.com/", "commercial"),
    link("Viber international calls", "https://www.viber.com/", "commercial"),
  ],
  UNI_D1_003: [
    link("Shelter — moving into rented accommodation", "https://england.shelter.org.uk/housing_advice/private_renting/moving_into_private_rented_accommodation", "support"),
  ],
  UNI_D7_001: GP_LINKS,
  UNI_D7_002: NI_LINKS,
  UNI_D7_003: BANK_COMPARE,
  UNI_D7_004: [
    ...HEALTHCARE_EXTRAS_LINKS,
    link("NHS 111 — urgent medical help", "https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111/"),
  ],
  UNI_D30_001: COUNCIL_TAX_LINKS,
  UNI_D30_002: [
    link("Exchange a foreign driving licence — DVLA", "https://www.gov.uk/exchange-foreign-driving-licence"),
    link("DVLA — driving licences", "https://www.gov.uk/browse/driving/licence"),
  ],
  UNI_D30_003: MENTAL_HEALTH_LINKS,
  UNI_D30_004: [...UTILITIES_LINKS, ...DEPOSIT_LINKS],
  UNI_D30_005: GP_LINKS,
  UNI_D30_006: NHS_LINKS,
  UNI_D30_007: BUDGET_LINKS,
  UNI_D90_001: EVISA_LINKS,
  UNI_D90_002: [
    link("Emergency services — when to call 999", "https://www.gov.uk/guidance/contact-the-emergency-services-and-urgent-help"),
    link("Action Fraud — report a scam", "https://www.actionfraud.police.uk/"),
  ],
  UNI_D90_003: CREDIT_LINKS,
  UNI_GRW_001: ILR_LINKS,
  UNI_GRW_002: [...SAVINGS_LINKS, ...BUDGET_LINKS],

  // ══════════════════════════════════════════════════════════════════════════
  // STU_ — International Student
  // ══════════════════════════════════════════════════════════════════════════
  STU_PRE_001: UNIVERSITY_PREP,
  STU_PRE_002: HOUSING_SEARCH,
  STU_PRE_003: EVISA_LINKS,
  STU_PRE_004: [
    link("National Rail journey planner", "https://www.nationalrail.co.uk/"),
    link("TfL journey planner", "https://tfl.gov.uk/plan-a-journey/"),
    link("National Express coaches", "https://www.nationalexpress.com/en", "commercial"),
  ],
  STU_PRE_005: [
    link("MoneyHelper — travel and banking basics", "https://www.moneyhelper.org.uk/en/everyday-money/banking", "support"),
    link("UKCISA — banking for international students", "https://www.ukcisa.org.uk/Information--Advice/Studying--living-in-the-UK/Opening-a-bank-account", "support"),
  ],
  STU_PRE_006: EVISA_LINKS,
  STU_PRE_007: PHONE_LINKS,
  STU_PRE_008: UNIVERSITY_PREP,
  STU_D1_001: [
    link("Emergency services guidance", "https://www.gov.uk/guidance/contact-the-emergency-services-and-urgent-help"),
    link("Action Fraud — report scams", "https://www.actionfraud.police.uk/"),
  ],
  STU_D1_002: [link("WhatsApp Web", "https://web.whatsapp.com/", "commercial")],
  STU_D1_003: [link("Shelter — moving into rented accommodation", "https://england.shelter.org.uk/housing_advice/private_renting/moving_into_private_rented_accommodation", "support")],
  STU_D1_004: [link("Shelter — inventory and check-in advice", "https://england.shelter.org.uk/housing_advice/private_renting/inventory_and_check_in", "support")],
  STU_D1_005: PHONE_LINKS,
  STU_D1_006: UNIVERSITY_PORTAL,
  STU_D7_001: [link("Google Maps route planner", "https://www.google.com/maps/", "support"), ...UNIVERSITY_PORTAL],
  STU_D7_002: STUDENT_BANK,
  STU_D7_003: GP_LINKS,
  STU_D7_004: NHS_LINKS,
  STU_D7_005: TRANSPORT_LINKS,
  STU_D7_006: COUNCIL_TAX_LINKS,
  STU_D7_007: COMMUNITY_LINKS,
  STU_D7_008: SHOPPING_LINKS,
  STU_D7_009: UTILITIES_LINKS,
  STU_D7_010: DEPOSIT_LINKS,
  STU_D30_001: STUDENT_BANK,
  STU_D30_002: GP_LINKS,
  STU_D30_003: NI_LINKS,
  STU_D30_004: BUDGET_LINKS,
  STU_D30_005: UNIVERSITY_PORTAL,
  STU_D30_006: WORK_RIGHTS_LINKS,
  STU_D30_007: TENANT_RIGHTS_LINKS,
  STU_D30_008: COUNCIL_TAX_LINKS,
  STU_D30_009: [
    ...JOB_SEARCH_LINKS,
    ...FLEX_WORK_LINKS,
    link("Prospects student jobs", "https://www.prospects.ac.uk/jobs-and-work-experience/student-jobs", "commercial"),
    link("Action Fraud — spot job scams", "https://www.actionfraud.police.uk/"),
  ],
  STU_D30_010: HEALTHCARE_EXTRAS_LINKS,
  STU_D90_001: BUDGET_LINKS,
  STU_D90_002: [
    link("Current Account Switch Service", "https://www.currentaccountswitch.co.uk/"),
    ...BANK_COMPARE.slice(0, 3),
    link("MoneyHelper — comparing bank accounts", "https://www.moneyhelper.org.uk/en/everyday-money/banking/basic-bank-accounts", "support"),
  ],
  STU_D90_003: HOUSING_SEARCH,
  STU_D90_004: UNIVERSITY_PORTAL,
  STU_D90_005: [
    ...JOB_SEARCH_LINKS,
    ...FLEX_WORK_LINKS,
    link("Prospects student jobs", "https://www.prospects.ac.uk/jobs-and-work-experience/student-jobs", "commercial"),
    link("Gradcracker internships", "https://www.gradcracker.com/", "commercial"),
    link("TargetJobs internships", "https://targetjobs.co.uk/careers-advice/internships", "commercial"),
  ],
  STU_D90_006: [link("UKCISA — living in the UK", "https://www.ukcisa.org.uk/Information--Advice/Studying--living-in-the-UK", "support"), ...BUDGET_LINKS],
  STU_D90_007: HEALTHCARE_EXTRAS_LINKS,
  STU_D90_008: SAVINGS_LINKS,
  STU_D90_009: NETWORKING_LINKS,
  STU_D90_010: [link("WhatsApp Web", "https://web.whatsapp.com/", "commercial")],

  // ══════════════════════════════════════════════════════════════════════════
  // SKW_ — Skilled Worker
  // ══════════════════════════════════════════════════════════════════════════
  SKW_PRE_001: [
    link("Skilled Worker visa — CoS details", "https://www.gov.uk/skilled-worker-visa/your-certificate-of-sponsorship"),
    link("Check your employer's sponsor licence", "https://www.gov.uk/check-uk-visa-sponsor-organisation"),
  ],
  SKW_PRE_002: SKILLED_WORKER_LINKS,
  SKW_PRE_003: [
    link("Acas — starting a new job", "https://www.acas.org.uk/starting-a-new-job"),
  ],
  SKW_PRE_004: HOUSING_SEARCH,
  SKW_PRE_005: [
    link("Skilled Worker visa — salary requirements", "https://www.gov.uk/skilled-worker-visa/your-salary"),
    link("Eligible occupations and salary thresholds", "https://www.gov.uk/government/publications/skilled-worker-visa-eligible-occupations"),
  ],
  SKW_D1_001: RIGHT_TO_WORK_LINKS,
  SKW_D7_001: [
    link("Workplace pensions explained", "https://www.gov.uk/workplace-pensions"),
    link("MoneyHelper — auto enrolment", "https://www.moneyhelper.org.uk/en/pensions-and-retirement/auto-enrolment", "support"),
  ],
  SKW_D7_002: [
    link("Acas — settling into a new job", "https://www.acas.org.uk/starting-a-new-job"),
  ],
  SKW_D7_003: PAYE_LINKS,
  SKW_D30_001: ACAS_LINKS,
  SKW_D30_002: PAYE_LINKS,
  SKW_D30_003: [
    link("Acas — holiday and annual leave", "https://www.acas.org.uk/annual-leave-and-holiday-pay"),
    link("Statutory Sick Pay (SSP)", "https://www.gov.uk/statutory-sick-pay"),
  ],
  SKW_D30_004: FAMILY_VISA_LINKS,
  SKW_D90_001: SKILLED_WORKER_LINKS,
  SKW_GRW_001: ILR_LINKS,
  SKW_GRW_002: [
    link("Skilled Worker visa — extend or switch", "https://www.gov.uk/skilled-worker-visa/extend-or-switch-to-this-visa"),
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // HCW_ — Health and Care Worker
  // ══════════════════════════════════════════════════════════════════════════
  HCW_PRE_001: [
    link("Health and Care Worker visa overview", "https://www.gov.uk/health-care-worker-visa"),
    link("CoS details for Health and Care Worker visa", "https://www.gov.uk/health-care-worker-visa/your-certificate-of-sponsorship"),
  ],
  HCW_PRE_002: DBS_LINKS,
  HCW_PRE_003: RIGHT_TO_WORK_LINKS,
  HCW_PRE_004: [
    link("NHS AfC pay scales", "https://www.nhsemployers.org/pay-conditions/national-pay-scales"),
    link("NHS pay and benefits", "https://www.healthcareers.nhs.uk/working-health/working-nhs/nhs-pay-and-benefits"),
  ],
  HCW_D1_001: RIGHT_TO_WORK_LINKS,
  HCW_D7_001: PROFESSIONAL_REG_LINKS,
  HCW_D7_002: DBS_LINKS,
  HCW_D7_003: [
    link("NHS occupational health — what to expect", "https://www.healthcareers.nhs.uk/working-health/working-nhs/nhs-pay-and-benefits/occupational-health"),
  ],
  HCW_D7_004: PROFESSIONAL_REG_LINKS,
  HCW_D7_005: PAYE_LINKS,
  HCW_D30_001: [
    link("e-Learning for Health — NHS mandatory training", "https://www.e-lfh.org.uk/"),
    link("NHS Learning Hub", "https://learninghub.nhs.uk/"),
  ],
  HCW_D30_002: PAYE_LINKS,
  HCW_D30_003: PROFESSIONAL_REG_LINKS,
  HCW_D30_004: [
    link("NHS Pension Scheme", "https://www.nhspensionscheme.nhs.uk/"),
    link("NHS pension member guides", "https://www.nhspensionscheme.nhs.uk/members/"),
  ],
  HCW_D30_005: NHS_CAREER_LINKS,
  HCW_D30_006: [
    link("NHS AfC pay scales and banding", "https://www.nhsemployers.org/pay-conditions/national-pay-scales"),
  ],
  HCW_D90_001: EVISA_LINKS,
  HCW_D90_002: [
    link("NHS preceptorship framework", "https://www.healthcareers.nhs.uk/working-health/working-nhs/career-progression/preceptorship"),
  ],
  HCW_D90_003: [
    link("NMC — revalidation", "https://www.nmc.org.uk/revalidation/"),
    link("GMC — revalidation", "https://www.gmc-uk.org/registration-and-licensing/managing-your-registration/revalidation"),
    link("HCPC — CPD and standards", "https://www.hcpc-uk.org/registration/continuing-professional-development/"),
  ],
  HCW_GRW_001: NHS_CAREER_LINKS,
  HCW_GRW_002: [
    link("e-Learning for Health — NHS CPD", "https://www.e-lfh.org.uk/"),
    link("NHS career progression guide", "https://www.healthcareers.nhs.uk/working-health/working-nhs/career-progression"),
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // GRD_ — Graduate Route
  // ══════════════════════════════════════════════════════════════════════════
  GRD_PRE_001: [
    link("Graduate Route visa overview", "https://www.gov.uk/graduate-visa"),
    link("Check your graduate visa status (eVisa)", "https://www.gov.uk/view-prove-immigration-status"),
  ],
  GRD_PRE_002: EVISA_LINKS,
  GRD_D7_001: [
    link("LinkedIn — edit your profile", "https://www.linkedin.com/in/", "commercial"),
    link("LinkedIn profile tips", "https://www.linkedin.com/help/linkedin/answer/a554351", "commercial"),
  ],
  GRD_D7_002: [
    link("National Careers Service — career advice", "https://nationalcareers.service.gov.uk/careers-advice"),
    link("Prospects — graduate careers", "https://www.prospects.ac.uk/graduate-jobs", "commercial"),
  ],
  GRD_D7_003: BANK_COMPARE,
  GRD_D7_004: NI_LINKS,
  GRD_D7_005: [
    link("LinkedIn — update your profile", "https://www.linkedin.com/in/", "commercial"),
    link("GitHub — showcase your work", "https://github.com/", "commercial"),
  ],
  GRD_D30_001: [
    link("National Careers — CV sections guide", "https://nationalcareers.service.gov.uk/careers-advice/cv-sections"),
    link("National Careers — CV template", "https://nationalcareers.service.gov.uk/careers-advice/cv-template"),
  ],
  GRD_D30_002: COUNCIL_TAX_LINKS,
  GRD_D30_003: [
    link("Register of licensed sponsors (UK employers)", "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"),
    link("Skilled Worker visa — sponsorship", "https://www.gov.uk/skilled-worker-visa/your-certificate-of-sponsorship"),
  ],
  GRD_D30_004: [
    link("Skilled Worker visa salary requirements", "https://www.gov.uk/skilled-worker-visa/your-salary"),
    link("Glassdoor salary checker", "https://www.glassdoor.co.uk/Salaries/index.htm", "commercial"),
  ],
  GRD_D30_005: [
    link("LinkedIn Skills assessment", "https://www.linkedin.com/learning/", "commercial"),
    link("National Careers — skills assessment", "https://nationalcareers.service.gov.uk/skills-assessment"),
  ],
  GRD_D30_006: SELF_EMPLOYED_LINKS,
  GRD_D90_001: [...JOB_SEARCH_LINKS, ...FLEX_WORK_LINKS],
  GRD_GRW_001: SKILLED_WORKER_LINKS,
  GRD_GRW_002: [
    link("National Careers — interview advice", "https://nationalcareers.service.gov.uk/careers-advice/interview-advice"),
    link("Glassdoor interview questions", "https://www.glassdoor.co.uk/Interview/index.htm", "commercial"),
  ],
  GRD_GRW_003: [
    link("Graduate Route visa details", "https://www.gov.uk/graduate-visa"),
    link("Switch to Skilled Worker visa", "https://www.gov.uk/skilled-worker-visa"),
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // GTL_ — Global Talent
  // ══════════════════════════════════════════════════════════════════════════
  GTL_PRE_001: [
    link("Global Talent visa overview", "https://www.gov.uk/global-talent"),
    link("Global Talent endorsement bodies", "https://www.gov.uk/global-talent/endorsement"),
  ],
  GTL_PRE_002: SELF_EMPLOYED_LINKS,
  GTL_PRE_003: [
    link("Global Talent visa eligibility", "https://www.gov.uk/global-talent/eligibility"),
    link("LinkedIn — build your professional presence", "https://www.linkedin.com/", "commercial"),
  ],
  GTL_D7_001: [
    link("LinkedIn — update your profile", "https://www.linkedin.com/in/", "commercial"),
    link("GitHub — showcase your projects", "https://github.com/", "commercial"),
  ],
  GTL_D7_002: [
    link("Global Talent — endorsing bodies", "https://www.gov.uk/global-talent/endorsement"),
  ],
  GTL_D7_003: SELF_EMPLOYED_LINKS,
  GTL_D7_004: [
    link("Find your UTR number", "https://www.gov.uk/find-lost-utr-number"),
    link("Register for Self Assessment", "https://www.gov.uk/register-for-self-assessment"),
  ],
  GTL_D7_005: BUSINESS_BANK,
  GTL_D30_001: [
    link("Self Assessment tax return", "https://www.gov.uk/self-assessment-tax-returns"),
    link("HMRC — register for Self Assessment", "https://www.gov.uk/register-for-self-assessment"),
  ],
  GTL_D30_002: [
    link("LinkedIn — record your achievements", "https://www.linkedin.com/in/", "commercial"),
    link("GitHub — maintain your portfolio", "https://github.com/", "commercial"),
  ],
  GTL_D30_003: [
    link("Global Talent — endorsing body contacts", "https://www.gov.uk/global-talent/endorsement"),
  ],
  GTL_D30_004: [
    link("LinkedIn", "https://www.linkedin.com/", "commercial"),
    link("Eventbrite — professional events", "https://www.eventbrite.co.uk/", "commercial"),
    link("Meetup — tech and professional communities", "https://www.meetup.com/", "commercial"),
  ],
  GTL_D90_001: [
    link("Global Talent visa — settlement (ILR)", "https://www.gov.uk/indefinite-leave-to-remain/global-talent-route"),
  ],
  GTL_GRW_001: [
    link("Global Talent settlement (ILR)", "https://www.gov.uk/indefinite-leave-to-remain/global-talent-route"),
    link("Endorsement requirements for settlement", "https://www.gov.uk/global-talent"),
  ],
  GTL_GRW_002: [
    link("Global Talent endorsing bodies", "https://www.gov.uk/global-talent/endorsement"),
  ],
  GTL_GRW_003: [
    link("Self Assessment tax return", "https://www.gov.uk/self-assessment-tax-returns"),
    link("HMRC — file your return", "https://www.gov.uk/log-in-file-self-assessment-tax-return"),
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // FND_ — Innovator Founder
  // ══════════════════════════════════════════════════════════════════════════
  FND_PRE_001: [
    link("Innovator Founder visa overview", "https://www.gov.uk/innovator-founder-visa"),
    link("Innovator Founder endorsement bodies", "https://www.gov.uk/innovator-founder-visa/endorse-your-business-idea"),
  ],
  FND_PRE_002: [
    link("GOV.UK — write a business plan", "https://www.gov.uk/write-business-plan"),
    link("Companies House — check company name availability", "https://find-and-update.company-information.service.gov.uk/"),
  ],
  FND_PRE_003: COMPANIES_HOUSE_LINKS,
  FND_PRE_004: [
    link("Find a chartered accountant — ICAEW", "https://www.icaew.com/about-icaew/find-a-chartered-accountant"),
    link("Find a tax adviser — CIOT", "https://www.tax.org.uk/public/find-a-tax-adviser"),
  ],
  FND_PRE_005: [
    link("Registered office address requirements", "https://www.gov.uk/limited-company-formation/registered-office-address"),
    link("Register your company — Companies House", "https://www.gov.uk/limited-company-formation/register-your-company"),
  ],
  FND_D7_001: COMPANIES_HOUSE_LINKS,
  FND_D7_002: [
    link("Corporation Tax overview", "https://www.gov.uk/corporation-tax"),
    link("Register for Corporation Tax", "https://www.gov.uk/register-for-corporation-tax"),
  ],
  FND_D7_003: [
    link("Innovator Founder endorsing bodies", "https://www.gov.uk/innovator-founder-visa/endorse-your-business-idea"),
  ],
  FND_D30_001: BUSINESS_BANK,
  FND_D30_002: [
    link("Register for VAT", "https://www.gov.uk/register-for-vat"),
    link("VAT — when to register", "https://www.gov.uk/vat-registration/when-to-register"),
  ],
  FND_D30_003: [
    link("Beginly Evidence Room", "/evidence-room", "support"),
  ],
  FND_D30_004: [
    link("WeWork co-working spaces", "https://www.wework.com/l/coworking-space/london-GB", "commercial"),
    link("Regus workspace locator", "https://www.regus.com/en-gb/search?country=GB", "commercial"),
  ],
  FND_D30_005: [
    link("Find your UTR number", "https://www.gov.uk/find-lost-utr-number"),
    link("Register for Corporation Tax", "https://www.gov.uk/register-for-corporation-tax"),
  ],
  FND_D30_006: [
    link("ABI — insurance for small businesses", "https://www.abi.org.uk/products-and-issues/topics-and-issues/insurance-for-small-businesses/", "support"),
  ],
  FND_D30_007: [
    link("Startups.co.uk — UK startup ecosystem", "https://startups.co.uk/", "commercial"),
    link("Beauhurst — UK startup news and data", "https://beauhurst.com/", "commercial"),
  ],
  FND_D90_001: [
    link("Beginly Evidence Room", "/evidence-room", "support"),
  ],
  FND_D90_002: [
    link("Intellectual Property Office", "https://www.gov.uk/government/organisations/intellectual-property-office"),
    link("Apply for a patent", "https://www.gov.uk/patent-your-invention"),
  ],
  FND_D90_003: [
    link("Companies House — confirmation statement", "https://www.gov.uk/confirmation-statement"),
  ],
  FND_GRW_001: [
    link("Innovator Founder settlement (ILR)", "https://www.gov.uk/innovator-founder-visa/settlement-indefinite-leave-to-remain"),
  ],
  FND_GRW_002: [
    link("Seed Enterprise Investment Scheme (SEIS)", "https://www.gov.uk/guidance/venture-capital-schemes-apply-for-the-seed-enterprise-investment-scheme"),
    link("Enterprise Investment Scheme (EIS)", "https://www.gov.uk/guidance/venture-capital-schemes-apply-for-enterprise-investment-scheme"),
  ],
  FND_GRW_003: [
    link("Acas — employment law for employers", "https://www.acas.org.uk/"),
    link("GOV.UK — employing people", "https://www.gov.uk/browse/employing-people"),
  ],
  FND_GRW_004: [
    link("Self-Invested Personal Pension (SIPP)", "https://www.gov.uk/self-invested-personal-pensions"),
    link("MoneyHelper — personal pensions", "https://www.moneyhelper.org.uk/en/pensions-and-retirement/building-your-retirement-pot/personal-pensions", "support"),
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // FAM_ — Family Visa
  // ══════════════════════════════════════════════════════════════════════════
  FAM_PRE_001: [
    link("Family visa overview", "https://www.gov.uk/uk-family-visa"),
    link("Check your visa status (eVisa)", "https://www.gov.uk/view-prove-immigration-status"),
  ],
  FAM_PRE_002: [
    link("School admissions — GOV.UK", "https://www.gov.uk/schools-admissions"),
    link("Find a school in England", "https://www.gov.uk/school-performance-tables"),
  ],
  FAM_PRE_003: HOUSING_SEARCH,
  FAM_PRE_004: CHILDCARE_LINKS,
  FAM_D7_001: [
    link("Apply for a school place", "https://www.gov.uk/apply-for-primary-school-place"),
    link("School admissions process", "https://www.gov.uk/schools-admissions"),
  ],
  FAM_D7_002: [
    link("Work rights on a family visa", "https://www.gov.uk/uk-family-visa/work-and-study"),
    link("Prove your right to work", "https://www.gov.uk/prove-right-to-work"),
    ...FLEX_WORK_LINKS,
  ],
  FAM_D7_003: GP_LINKS,
  FAM_D7_004: CHILDCARE_LINKS,
  FAM_D30_001: [
    link("Find free English classes", "https://www.gov.uk/find-free-english-language-classes"),
    link("British Council — English resources", "https://www.britishcouncil.org/english", "support"),
  ],
  FAM_D30_002: [
    link("School admissions appeals", "https://www.gov.uk/appeal-school-admissions-decision"),
  ],
  FAM_D30_003: [...JOB_SEARCH_LINKS, ...FLEX_WORK_LINKS],
  FAM_D30_004: [
    link("Child Benefit — claim online", "https://www.gov.uk/child-benefit/overview"),
    link("Child Benefit rates and eligibility", "https://www.gov.uk/child-benefit"),
  ],
  FAM_D30_005: BUDGET_LINKS,
  FAM_GRW_001: [
    link("Family visa settlement (ILR)", "https://www.gov.uk/indefinite-leave-to-remain/partner-or-spouse-uk-and-settled-status"),
    ...ILR_LINKS,
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // Journey Hub adaptive tasks (common-* and route-specific)
  // ══════════════════════════════════════════════════════════════════════════
  "common-identity": EVISA_LINKS,
  "common-gp": GP_LINKS,
  "common-bank": BANK_COMPARE,
  "common-safety": [
    link("Emergency services — when to call 999", "https://www.gov.uk/guidance/contact-the-emergency-services-and-urgent-help"),
    link("Action Fraud — report a scam", "https://www.actionfraud.police.uk/"),
    link("Citizens Advice — scams and fraud", "https://www.citizensadvice.org.uk/consumer/scams/", "support"),
  ],
  "common-local": [
    link("Find your local council", "https://www.gov.uk/find-local-council"),
    link("NHS services near you", "https://www.nhs.uk/nhs-services/"),
  ],
  "student-enrolment": UNIVERSITY_PORTAL,
  "student-academic-plan": [
    link("UKCISA — studying in the UK", "https://www.ukcisa.org.uk/Information--Advice/Studying--living-in-the-UK", "support"),
    link("National Careers Service", "https://nationalcareers.service.gov.uk/"),
  ],
  "student-experience": [
    ...FLEX_WORK_LINKS,
    link("TargetJobs — internships and experience", "https://targetjobs.co.uk/careers-advice/internships", "commercial"),
    link("Prospects — student jobs and placements", "https://www.prospects.ac.uk/jobs-and-work-experience/student-jobs", "commercial"),
  ],
  "student-cv": [
    link("National Careers — CV guide", "https://nationalcareers.service.gov.uk/careers-advice/cv-sections"),
    link("National Careers — CV template", "https://nationalcareers.service.gov.uk/careers-advice/cv-template"),
  ],
  "student-sponsor": [
    link("Register of licensed sponsors", "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"),
    link("Skilled Worker visa overview", "https://www.gov.uk/skilled-worker-visa"),
  ],
  "graduate-route-review": [
    link("Graduate Route visa details", "https://www.gov.uk/graduate-visa"),
    link("Check your visa status", "https://www.gov.uk/view-prove-immigration-status"),
  ],
  "graduate-career-positioning": [
    ...JOB_SEARCH_LINKS,
    link("National Careers — career planning", "https://nationalcareers.service.gov.uk/careers-advice"),
  ],
  "graduate-applications": [...JOB_SEARCH_LINKS, ...FLEX_WORK_LINKS],
  "worker-employment-records": [
    ...RIGHT_TO_WORK_LINKS,
    link("Skilled Worker visa details", "https://www.gov.uk/skilled-worker-visa"),
  ],
  "worker-progression": [
    link("National Careers — career progression", "https://nationalcareers.service.gov.uk/careers-advice"),
    link("LinkedIn Learning", "https://www.linkedin.com/learning/", "commercial"),
  ],
  "worker-family": FAMILY_VISA_LINKS,
  "care-professional-records": [...PROFESSIONAL_REG_LINKS, ...NHS_CAREER_LINKS],
  "care-progression": NHS_CAREER_LINKS,
  "care-wellbeing": [
    link("NHS — staff wellbeing support", "https://www.england.nhs.uk/supporting-our-nhs-people/", "support"),
    ...MENTAL_HEALTH_LINKS,
  ],
  "family-shared-plan": [
    link("Family visa overview", "https://www.gov.uk/uk-family-visa"),
    link("School admissions", "https://www.gov.uk/schools-admissions"),
    ...CHILDCARE_LINKS,
  ],
  "family-private-goals": [
    link("National Careers Service", "https://nationalcareers.service.gov.uk/"),
    link("GOV.UK — education and learning", "https://www.gov.uk/browse/education"),
  ],
  "family-career": [...JOB_SEARCH_LINKS, ...FLEX_WORK_LINKS],
  "founder-thesis": [
    link("Innovator Founder visa overview", "https://www.gov.uk/innovator-founder-visa"),
    link("Beginly Evidence Room", "/evidence-room", "support"),
  ],
  "founder-evidence": [link("Beginly Evidence Room", "/evidence-room", "support")],
  "founder-validation": [link("GOV.UK — write a business plan", "https://www.gov.uk/write-business-plan")],
  "founder-scale": COMPANIES_HOUSE_LINKS,
  "talent-evidence": [
    link("Global Talent visa overview", "https://www.gov.uk/global-talent"),
    link("LinkedIn — showcase your work", "https://www.linkedin.com/", "commercial"),
  ],
  "talent-network": [
    link("LinkedIn", "https://www.linkedin.com/", "commercial"),
    link("Eventbrite — professional events", "https://www.eventbrite.co.uk/", "commercial"),
    link("Meetup — community events", "https://www.meetup.com/", "commercial"),
  ],
  "humanitarian-safe-support": [
    link("Refugee Council", "https://www.refugeecouncil.org.uk/", "support"),
    link("Citizens Advice", "https://www.citizensadvice.org.uk/", "support"),
    link("UNHCR UK", "https://www.unhcr.org/uk/", "support"),
  ],
  "humanitarian-local-life": [
    link("Citizens Advice", "https://www.citizensadvice.org.uk/", "support"),
    link("Find your local council", "https://www.gov.uk/find-local-council"),
  ],
};

export function getTaskLinks(taskId: string): ResourceLink[] {
  return TASK_LINKS[taskId] ?? [];
}

export function hasTaskLinks(taskId: string): boolean {
  return getTaskLinks(taskId).length > 0;
}
