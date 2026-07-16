import type { ResourceLink } from "@/types";

const link = (label: string, url: string, kind: ResourceLink["kind"] = "official"): ResourceLink => ({
  label,
  url,
  kind,
});

const UNIVERSITY_PREP = [
  link("UCAS student advice", "https://www.ucas.com/students", "university"),
  link("UKCISA preparation guides", "https://www.ukcisa.org.uk/Information--Advice/Preparing--planning", "support"),
];

const UNIVERSITY_PORTAL = [
  link("UCAS student advice", "https://www.ucas.com/students", "university"),
  link("UKCISA living and studying in the UK", "https://www.ukcisa.org.uk/Information--Advice/Studying--living-in-the-UK", "support"),
];

const HOUSING_SEARCH = [
  link("OpenRent", "https://www.openrent.co.uk/", "housing"),
  link("Zoopla rentals", "https://www.zoopla.co.uk/to-rent/", "housing"),
  link("SpareRoom", "https://www.spareroom.co.uk/", "housing"),
  link("Shelter housing advice", "https://england.shelter.org.uk/housing_advice/private_renting", "support"),
];

const EVISA_LINKS = [
  link("View and prove your immigration status", "https://www.gov.uk/view-prove-immigration-status"),
  link("UKVI account sign in", "https://www.gov.uk/update-uk-visas-immigration-account-details"),
];

const PHONE_LINKS = [
  link("Ofcom mobile and broadband checker", "https://checker.ofcom.org.uk/", "official"),
  link("Uswitch SIM-only deals", "https://www.uswitch.com/mobiles/compare/sim_only_deals/", "commercial"),
];

const BANK_COMPARE = [
  link("MoneyHelper bank accounts guide", "https://www.moneyhelper.org.uk/en/everyday-money/banking/basic-bank-accounts", "support"),
  link("Santander student account", "https://www.santander.co.uk/personal/current-accounts/123-student-current-account", "bank"),
  link("HSBC student account", "https://www.hsbc.co.uk/current-accounts/products/student/", "bank"),
  link("NatWest student account", "https://www.natwest.com/current-accounts/student_account.html", "bank"),
  link("Lloyds student account", "https://www.lloydsbank.com/current-accounts/student-account.html", "bank"),
  link("Monzo current account", "https://monzo.com/current-account/", "bank"),
  link("Revolut", "https://www.revolut.com/", "bank"),
  link("Starling current account", "https://www.starlingbank.com/current-account/", "bank"),
];

const GP_LINKS = [
  link("Find a GP", "https://www.nhs.uk/service-search/find-a-gp"),
  link("How to register with a GP surgery", "https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/"),
];

const NHS_LINKS = [
  link("NHS services", "https://www.nhs.uk/nhs-services/"),
  link("NHS App", "https://www.nhs.uk/nhs-app/"),
];

const TRANSPORT_LINKS = [
  link("16-25 Railcard", "https://www.16-25railcard.co.uk/", "commercial"),
  link("Student Oyster photocard", "https://tfl.gov.uk/fares/free-and-discounted-travel/18-plus-student-oyster-photocard", "official"),
  link("National Rail discounts", "https://www.nationalrail.co.uk/tickets-railcards-and-offers/railcards/", "official"),
];

const COUNCIL_TAX_LINKS = [
  link("Council Tax and students", "https://www.gov.uk/council-tax/who-has-to-pay"),
  link("Council Tax support and exemptions", "https://www.citizensadvice.org.uk/housing/council-tax/check-if-you-can-pay-less-council-tax/", "support"),
];

const COMMUNITY_LINKS = [
  link("Students' Union finder", "https://www.nus.org.uk/", "support"),
  link("Meetup", "https://www.meetup.com/", "commercial"),
  link("Student Minds", "https://www.studentminds.org.uk/", "support"),
];

const SHOPPING_LINKS = [
  link("Tesco store locator", "https://www.tesco.com/store-locator/", "commercial"),
  link("Sainsbury's store locator", "https://stores.sainsburys.co.uk/", "commercial"),
  link("Aldi store finder", "https://store.aldi.co.uk/", "commercial"),
];

const UTILITIES_LINKS = [
  link("Ofgem consumer advice", "https://www.ofgem.gov.uk/information-consumers", "official"),
  link("Citizens Advice energy help", "https://www.citizensadvice.org.uk/consumer/energy/energy-supply/", "support"),
];

const DEPOSIT_LINKS = [
  link("Deposit Protection Service", "https://www.depositprotection.com/", "official"),
  link("Tenancy Deposit Scheme", "https://www.tenancydepositscheme.com/", "official"),
  link("mydeposits", "https://www.mydeposits.co.uk/", "official"),
];

const BUDGET_LINKS = [
  link("Open Beginly budget planner", "/budget", "support"),
  link("Save the Student budgeting guide", "https://www.savethestudent.org/student-finance/budgeting.html", "commercial"),
];

const NI_LINKS = [
  link("Apply for a National Insurance number", "https://www.gov.uk/apply-national-insurance-number"),
  link("National Insurance explained", "https://www.gov.uk/national-insurance"),
];

const WORK_RIGHTS_LINKS = [
  link("Working in the UK while studying", "https://www.ukcisa.org.uk/Information--Advice/Working/Student-work", "support"),
  link("Right to work checks", "https://www.gov.uk/prove-right-to-work"),
];

const TENANT_RIGHTS_LINKS = [
  link("Shelter private renting advice", "https://england.shelter.org.uk/housing_advice/private_renting", "support"),
  link("How to rent guide", "https://www.gov.uk/government/publications/how-to-rent", "official"),
];

const JOB_SEARCH_LINKS = [
  link("National Careers Service CV advice", "https://nationalcareers.service.gov.uk/careers-advice/cv-sections", "official"),
  link("Prospects student jobs", "https://www.prospects.ac.uk/jobs-and-work-experience/student-jobs", "commercial"),
  link("Indeed", "https://uk.indeed.com/", "commercial"),
  link("Indeed Flex referral bonus", "https://indeedflex.onelink.me/4jvh/referafriend", "commercial"),
  link("Glassdoor jobs", "https://www.glassdoor.co.uk/Job/index.htm", "commercial"),
  link("Action Fraud", "https://www.actionfraud.police.uk/", "official"),
];

const HEALTHCARE_EXTRAS_LINKS = [
  link("Find a dentist", "https://www.nhs.uk/service-search/find-a-dentist"),
  link("Find an optician", "https://www.nhs.uk/service-search/find-an-optician"),
  link("Find a pharmacy", "https://www.nhs.uk/service-search/pharmacy/find-a-pharmacy"),
];

const SAVINGS_LINKS = [
  link("MoneyHelper savings guide", "https://www.moneyhelper.org.uk/en/savings/how-to-save/how-to-open-a-savings-account", "support"),
  link("FSCS protection checker", "https://www.fscs.org.uk/check/check-your-money-is-protected/", "official"),
];

const NETWORKING_LINKS = [
  link("LinkedIn", "https://www.linkedin.com/", "commercial"),
  link("Prospects careers advice", "https://www.prospects.ac.uk/careers-advice", "commercial"),
  link("TargetJobs internships", "https://targetjobs.co.uk/careers-advice/internships", "commercial"),
];

const TASK_LINKS: Record<string, ResourceLink[]> = {
  STU_PRE_001: UNIVERSITY_PREP,
  STU_PRE_002: HOUSING_SEARCH,
  STU_PRE_003: EVISA_LINKS,
  STU_PRE_004: [
    link("National Rail journey planner", "https://www.nationalrail.co.uk/", "official"),
    link("TfL journey planner", "https://tfl.gov.uk/plan-a-journey/", "official"),
    link("National Express", "https://www.nationalexpress.com/en", "commercial"),
  ],
  STU_PRE_005: [
    link("MoneyHelper travel and banking basics", "https://www.moneyhelper.org.uk/en/everyday-money/banking", "support"),
    link("UKCISA banking for international students", "https://www.ukcisa.org.uk/Information--Advice/Studying--living-in-the-UK/Opening-a-bank-account", "support"),
  ],
  STU_PRE_006: EVISA_LINKS,
  STU_PRE_007: PHONE_LINKS,
  STU_PRE_008: UNIVERSITY_PREP,
  STU_D1_001: [
    link("Emergency services guidance", "https://www.gov.uk/guidance/contact-the-emergency-services-and-urgent-help", "official"),
    link("Action Fraud", "https://www.actionfraud.police.uk/", "official"),
  ],
  STU_D1_002: [link("WhatsApp Web", "https://web.whatsapp.com/", "commercial")],
  STU_D1_003: [link("Shelter moving into rented accommodation", "https://england.shelter.org.uk/housing_advice/private_renting/moving_into_private_rented_accommodation", "support")],
  STU_D1_004: [link("Shelter inventory and check-in advice", "https://england.shelter.org.uk/housing_advice/private_renting/inventory_and_check_in", "support")],
  STU_D1_005: PHONE_LINKS,
  STU_D1_006: UNIVERSITY_PORTAL,
  STU_D7_001: [
    link("Google Maps route planner", "https://www.google.com/maps/", "support"),
    ...UNIVERSITY_PORTAL,
  ],
  STU_D7_002: BANK_COMPARE,
  STU_D7_003: GP_LINKS,
  STU_D7_004: NHS_LINKS,
  STU_D7_005: TRANSPORT_LINKS,
  STU_D7_006: COUNCIL_TAX_LINKS,
  STU_D7_007: COMMUNITY_LINKS,
  STU_D7_008: SHOPPING_LINKS,
  STU_D7_009: UTILITIES_LINKS,
  STU_D7_010: DEPOSIT_LINKS,
  STU_D30_001: BANK_COMPARE,
  STU_D30_002: GP_LINKS,
  STU_D30_003: NI_LINKS,
  STU_D30_004: BUDGET_LINKS,
  STU_D30_005: UNIVERSITY_PORTAL,
  STU_D30_006: WORK_RIGHTS_LINKS,
  STU_D30_007: TENANT_RIGHTS_LINKS,
  STU_D30_008: COUNCIL_TAX_LINKS,
  STU_D30_009: JOB_SEARCH_LINKS,
  STU_D30_010: HEALTHCARE_EXTRAS_LINKS,
  STU_D90_001: BUDGET_LINKS,
  STU_D90_002: [
    link("MoneyHelper bank accounts guide", "https://www.moneyhelper.org.uk/en/everyday-money/banking/basic-bank-accounts", "support"),
    link("Current Account Switch Service", "https://www.currentaccountswitch.co.uk/", "official"),
  ],
  STU_D90_003: HOUSING_SEARCH,
  STU_D90_004: UNIVERSITY_PORTAL,
  STU_D90_005: [
    link("Indeed", "https://uk.indeed.com/", "commercial"),
    link("Indeed Flex referral bonus", "https://indeedflex.onelink.me/4jvh/referafriend", "commercial"),
    link("Glassdoor jobs", "https://www.glassdoor.co.uk/Job/index.htm", "commercial"),
    link("Prospects student jobs", "https://www.prospects.ac.uk/jobs-and-work-experience/student-jobs", "commercial"),
    link("Gradcracker internships", "https://www.gradcracker.com/", "commercial"),
    link("TargetJobs internships", "https://targetjobs.co.uk/careers-advice/internships", "commercial"),
  ],
  STU_D90_006: [
    link("UKCISA living in the UK", "https://www.ukcisa.org.uk/Information--Advice/Studying--living-in-the-UK", "support"),
    link("Open Beginly budget planner", "/budget", "support"),
  ],
  STU_D90_007: HEALTHCARE_EXTRAS_LINKS,
  STU_D90_008: SAVINGS_LINKS,
  STU_D90_009: NETWORKING_LINKS,
  STU_D90_010: [link("WhatsApp Web", "https://web.whatsapp.com/", "commercial")],
};

export function getTaskLinks(taskId: string): ResourceLink[] {
  return TASK_LINKS[taskId] ?? [];
}

export function hasTaskLinks(taskId: string): boolean {
  return getTaskLinks(taskId).length > 0;
}
