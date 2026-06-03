import type { GuidanceArticle } from "@/types";

export const GUIDANCE_PAGES: GuidanceArticle[] = [
  {
    slug: "before-you-arrive",
    title: "Before You Arrive in the UK",
    category: "Documents",
    description: "Everything you need to do before you board your flight to the UK.",
    whatThisIs:
      "A pre-arrival checklist and preparation guide covering the most important tasks to complete before you travel to the UK as an international student.",
    whyItMatters:
      "Most problems international students face in their first week in the UK — lost documents, money issues, accommodation confusion, no phone signal — are preventable with good preparation before travel. The 2–4 weeks before departure are the most important weeks of your entire settlement journey.",
    whatToPrepare: [
      "Passport valid for at least 6 months beyond your planned UK departure",
      "UKVI online account / eVisa setup confirmation",
      "CAS letter from your university",
      "Proof of accommodation",
      "Travel insurance",
      "University enrolment confirmed",
    ],
    stepsToTake: [
      "Confirm university enrolment on the student portal — download your confirmation letter.",
      "Confirm accommodation and save the address and contact number.",
      "Check passport validity and apply for a new one if it expires within 6 months of your planned return.",
      "Tell your bank you are travelling to the UK so they do not block your card.",
      "Exchange some GBP and research UK SIM/eSIM options.",
      "Plan your airport-to-accommodation route and pre-book transport.",
      "Make digital copies of every important document.",
      "Notify your university of your arrival plan.",
    ],
    commonMistakes: [
      "Leaving university confirmation until the last minute — this delays everything else.",
      "Not checking passport expiry — the UK requires 6 months validity from arrival.",
      "Arriving without any GBP or a working phone — these are basic necessities.",
    ],
    safetyWarning: undefined,
    sourceSignpost:
      "Your university portal is the single source of truth for enrolment. gov.uk/student-visa for visa guidance.",
    disclaimer:
      "SettleMap provides general settlement guidance. This does not constitute legal, immigration, financial, tax, medical, or housing advice. For official matters, consult qualified professionals or official government sources.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_PRE_001", "STU_PRE_002", "STU_PRE_003", "STU_PRE_004", "STU_PRE_005", "STU_PRE_006", "STU_PRE_007", "STU_PRE_008"],
  },
  {
    slug: "first-24-hours",
    title: "Your First 24 Hours in the UK",
    category: "Safety",
    description: "What to prioritise on your arrival day — from getting through border control to settling into your accommodation.",
    whatThisIs:
      "A practical hour-by-hour guide for your first 24 hours in the UK, covering what to do at border control, how to get to your accommodation safely, and what to do first once you are inside.",
    whyItMatters:
      "The first 24 hours are overwhelming. You are tired from travel, in an unfamiliar city, with a new currency, possibly a new language, and a long list of things to do. Knowing exactly what to prioritse — and what can wait — means you make good decisions instead of expensive or stressful ones.",
    whatToPrepare: [
      "Passport, UKVI account confirmation (eVisa setup), and CAS letter in your hand luggage",
      "Airport-to-accommodation transport pre-booked and confirmed",
      "Accommodation address saved in your phone and on a printed card",
      "UK currency for immediate needs",
      "Charged phone with your accommodation's Wi-Fi password if available",
    ],
    stepsToTake: [
      "Go through border control — have your passport, UKVI account access (eVisa), and CAS ready.",
      "Collect your luggage and go through customs.",
      "Follow your pre-planned route to your accommodation.",
      "Once inside: check the accommodation condition, photograph everything, and report any issues immediately.",
      "Text your family to confirm safe arrival.",
      "Activate your UK SIM or eSIM and test it works.",
      "Rest — do not try to do everything on day one.",
    ],
    commonMistakes: [
      "Trying to do too much on the first day — exhaustion leads to poor decisions.",
      "Not checking accommodation condition and missing pre-existing damage.",
      "Not texting family — they may worry and try to contact you urgently.",
    ],
    safetyWarning:
      "If at any point you feel unsafe or threatened, leave the area and go to a public place. Call 999 for emergencies.",
    sourceSignpost: "UK Emergency Services: 999 | Non-emergency police: 101",
    disclaimer:
      "SettleMap provides general settlement guidance. This is not a substitute for official travel, immigration, or safety guidance.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_D1_001", "STU_D1_002", "STU_D1_003", "STU_D1_004", "STU_D1_005", "STU_D1_006"],
  },
  {
    slug: "uk-accommodation-guide",
    title: "Renting in the UK — A Plain-English Guide",
    category: "Accommodation",
    description: "Understanding how renting works in England, Scotland, and Wales as a student.",
    whatThisIs:
      "A plain-English guide to the UK private rented sector for students, covering tenancy types, tenant rights, landlord obligations, and what to look out for before signing a tenancy agreement.",
    whyItMatters:
      "Renting in the UK is different from renting in most other countries. The law strongly protects tenants — but only if you know your rights. Understanding your tenancy agreement before you sign it is the single biggest thing you can do to protect yourself from unexpected costs or disputes.",
    whatToPrepare: [
      "Your budget (monthly rent, deposit, and total move-in costs)",
      "Proof of student status",
      "Guarantor details if required (some landlords ask for a UK-based guarantor)",
    ],
    stepsToTake: [
      "Decide what you can afford — rent should not exceed 40% of your monthly income.",
      "Search on Rightmove, Zoopla, or via a university-accredited letting agent.",
      "View properties in person before paying anything — never pay a holding fee without seeing the property.",
      "Read the tenancy agreement carefully before signing — ask the university housing service to explain anything unclear.",
      "Check that your deposit will be protected in a government-approved scheme (TDS, DPS, or MyDeposits).",
      "Take timestamped photos of the property on move-in day.",
    ],
    commonMistakes: [
      "Paying a holding fee to a landlord you have not met or seen the property from.",
      "Not reading the tenancy agreement — the most important terms are always in the clauses.",
      "Signing a 12-month contract without understanding the exit terms.",
    ],
    safetyWarning:
      "Never transfer money to a landlord before receiving a written tenancy agreement and evidence of their ownership of the property. See the Housing Scam Warning guide.",
    sourceSignpost:
      "Shelter England: shelterengland.org | Shelter Scotland: shelter.scot | Tenant Fees Act guidance: gov.uk/guidance/tenant-fees-act",
    disclaimer:
      "This is general information about renting, not legal advice. For legal advice, contact Shelter or a qualified housing solicitor.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_PRE_002", "STU_D1_003", "STU_D1_004", "STU_D7_009", "STU_D7_010", "STU_D30_007"],
  },
  {
    slug: "housing-scam-warning",
    title: "Housing Scam Warning — How to Spot and Avoid Rental Scams",
    category: "Safety",
    description: "The most common housing scams targeting international students and how to protect yourself.",
    whatThisIs:
      "An updated guide to the housing scams most commonly targeting international students in the UK, with specific red flags and what to do if you have been targeted.",
    whyItMatters:
      "Housing scams are the most common type of fraud targeting international students. Scammers know that students are often unfamiliar with the UK rental market, may be desperate to find accommodation quickly, and are willing to transfer money to people they have never met. Loss of deposit money — or worse, arriving to find a fake property — can be devastating.",
    whatToPrepare: [
      "An understanding of the red flags listed below",
      "Knowledge that if it sounds too good to be true, it probably is",
      "Contact details for your university's accommodation service",
    ],
    stepsToTake: [
      "Never transfer money without seeing the property and meeting the landlord in person or via verified video call.",
      "Always use a letting agent registered with a government-approved property redress scheme.",
      "Never pay a holding fee without a proper Tenancy Application in writing.",
      "Check the Land Registry (gov.uk/search-property-information-land-registry) to verify the landlord owns the property.",
      "Use university-accredited landlords wherever possible.",
      "Search the address online — if it appears on multiple scam-listing sites, walk away.",
    ],
    commonMistakes: [
      "Paying a deposit to a landlord who says they are abroad — this is a very common scam.",
      "Rushing to secure accommodation through fear of not finding anything — scammers exploit this urgency.",
      "Not verifying the landlord's identity or property ownership before transferring money.",
    ],
    safetyWarning:
      "If you have transferred money to a suspected scammer, contact your bank immediately to try to stop the transfer. Report to Action Fraud on 0300 123 2040 or actionfraud.police.uk.",
    sourceSignpost:
      "Action Fraud: actionfraud.police.uk | Take Five to Stop Fraud: takefive-stopfraud.org.uk | Property Redress Scheme: propertyredress.co.uk",
    disclaimer:
      "SettleMap provides scam awareness guidance. This is not legal or financial advice. If you have been the victim of fraud, contact Action Fraud and your bank immediately.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_PRE_002", "STU_D30_007"],
  },
  {
    slug: "student-bank-account-prep",
    title: "Preparing to Open a UK Student Bank Account",
    category: "Money",
    description: "Documents you need, what to compare, and how to choose the right student bank account.",
    whatThisIs:
      "A practical guide to preparing for and opening a UK student bank account, including the documents you need, how to compare accounts, and what to watch out for.",
    whyItMatters:
      "A UK bank account is essential for paying rent, receiving wages from part-time work, and accessing student discounts. Many students underestimate how long the process takes — banks can take 1–2 weeks to process an account. Starting the research process in your first week means you are ready to apply as soon as you have proof of UK address.",
    whatToPrepare: [
      "Passport or UK driving licence",
      "eVisa (digital immigration status via your UKVI online account)",
      "Proof of UK address (tenancy agreement, accommodation letter, or recent utility bill)",
      "Proof of student status (university letter or student ID)",
      "University acceptance or enrolment letter",
    ],
    stepsToTake: [
      "Research student bank accounts using MoneySavingExpert or Which? comparison tools.",
      "Shortlist 2–3 accounts based on: overdraft limit, fees, and perks (railcards, Amazon vouchers, etc.).",
      "Visit a branch in person or apply online with all required documents.",
      "Expect the account opening process to take 3–7 working days.",
      "Set up mobile banking and a debit card.",
      "Never share your banking login details with anyone.",
    ],
    commonMistakes: [
      "Going to the first bank you see without comparing options — different banks have very different offers.",
      "Assuming you can open an account without proof of UK address — you almost always need this.",
      "Not telling your bank about your international student status — they may have specific products for you.",
    ],
    safetyWarning:
      "Your bank will never ask for your PIN, full password, or to move money to a 'safe account'. These are scam techniques. If anyone (including someone claiming to be from your bank) asks for this, hang up and call your bank's official number.",
    sourceSignpost:
      "MSE Student Bank Account Guide: moneysavingexpert.com | FCA regulated banks: fca.org.uk | Which? Best Buy: which.co.uk",
    disclaimer:
      "SettleMap provides general financial guidance. This is not financial advice. Compare products carefully before choosing a bank account.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_PRE_005", "STU_D7_002", "STU_D30_001"],
  },
  {
    slug: "how-to-register-with-a-gp",
    title: "How to Register with a NHS GP — Step by Step",
    category: "Health",
    description: "Registering with a UK family doctor (GP) as an international student — and why it matters.",
    whatThisIs:
      "A step-by-step guide to registering with an NHS GP (General Practitioner, or family doctor) as an international student in the UK.",
    whyItMatters:
      "GP registration is free and gives you access to the full National Health Service (NHS). Without registering, you cannot book appointments, get prescriptions, or be referred to hospital specialists when you need them. GP surgeries can close their lists to new patients — registering early, before you need medical help, is essential.",
    whatToPrepare: [
      "Your UK address",
      "Any previous medical records or summaries from your home country",
      "Your NHS number if you have one (find it at nhs.uk/nhs-services/nhs-number or your UKVI account)",
    ],
    stepsToTake: [
      "Search for NHS GP surgeries near your accommodation: nhs.uk/service-search/find-a-gp",
      "Call or visit your top 2–3 choices to confirm they are accepting new patients.",
      "Complete a GMS1 registration form (available from the surgery or online at nhs.uk).",
      "Submit the form in person or by post.",
      "Your NHS number will be posted to you within 2–3 weeks of registration.",
      "Download the NHS App to manage appointments and prescriptions online.",
    ],
    commonMistakes: [
      "Waiting until you are ill to try to register — GP lists can be full and you may not be able to register as an emergency patient.",
      "Not knowing which GP to choose — you can register with any GP surgery that has availability, not necessarily the nearest one.",
    ],
    safetyWarning: undefined,
    sourceSignpost:
      "NHS GP registration: nhs.uk/nhs-services/gps/how-to-register-with-a-gp | NHS App: nhs.uk/nhs-app",
    disclaimer:
      "SettleMap provides general health signposting. This is not medical advice. For medical concerns, contact the NHS or your GP.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_D7_003", "STU_D7_004", "STU_D30_002"],
  },
  {
    slug: "nhs-basics",
    title: "NHS Basics — Understanding Healthcare in the UK",
    category: "Health",
    description: "How the NHS works, what you are entitled to, and when to use each service.",
    whatThisIs:
      "A plain-English overview of the National Health Service (NHS) — what it is, how to access it, what is free, and when to use different NHS services.",
    whyItMatters:
      "As an international student, you have already paid the Immigration Health Surcharge as part of your visa fee. You are entitled to full NHS care. Understanding how the NHS works — and when to use 111 vs 999 vs a pharmacy vs a GP — means faster treatment and less pressure on emergency services.",
    whatToPrepare: [
      "Your NHS number (you get this after registering with a GP)",
      "The NHS App downloaded on your phone",
      "Knowledge of where your nearest GP, pharmacy, and hospital A&E are",
    ],
    stepsToTake: [
      "Register with a GP as soon as possible after arrival.",
      "Download and set up the NHS App.",
      "Learn the different NHS services: Pharmacy (minor ailments), GP (ongoing health), 111 (non-emergency medical help), A&E/999 (emergencies).",
      "Know that GP appointments and hospital treatment are free. Prescriptions (unless exempt) and dental care have costs.",
      "Apply for an HC2 certificate if you are on a low income — this gives free prescriptions and eye tests.",
    ],
    commonMistakes: [
      "Going to A&E for non-emergencies — this costs the NHS and delays treatment for people who genuinely need emergency care.",
      "Not knowing the difference between 111 (medical help, not an emergency) and 999 (life-threatening emergencies only).",
      "Assuming you will be charged for GP or hospital care — as a student visa holder, you are not.",
    ],
    safetyWarning:
      "In a life-threatening emergency, call 999. If you are unsure whether it is an emergency, call 111.",
    sourceSignpost:
      "NHS 111: dial 111 | NHS App: nhs.uk/nhs-app | Find a GP: nhs.uk/service-search/find-a-gp | HC2 certificate: nhs.uk/healthcosts",
    disclaimer:
      "SettleMap provides general health signposting. This is not medical advice. Always seek professional medical help for health concerns.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_D7_003", "STU_D7_004", "STU_D30_002", "STU_D30_010", "STU_D90_007"],
  },
  {
    slug: "council-tax-student-exemption",
    title: "Council Tax and Student Exemption — What You Need to Know",
    category: "Local Admin",
    description: "What council tax is, why students are exempt, and how to claim your exemption.",
    whatThisIs:
      "A plain-English guide to council tax for students — what it is, how student exemption works, and exactly what to do to avoid being wrongly billed.",
    whyItMatters:
      "Council tax is a mandatory local tax on residential properties. Full-time students are exempt. If you do not claim the exemption, the council assumes you are a liable resident and sends a bill. If that bill goes unpaid, it can result in court action and debt recovery — even if you are a student who should not be paying.",
    whatToPrepare: [
      "Your UK accommodation address",
      "Your tenancy agreement",
      "A student status letter from your university",
      "Your national insurance number (for the council application)",
    ],
    stepsToTake: [
      "Find your local council at gov.uk/find-your-local-council.",
      "Go to the council's website and search for 'student council tax exemption'.",
      "Complete their online exemption form with your student status letter and tenancy details.",
      "Get written confirmation from the council that the exemption has been applied.",
      "Keep copies of all correspondence.",
      "Re-apply at the start of each academic year if your course spans multiple years.",
    ],
    commonMistakes: [
      "Ignoring council tax letters because you think you do not need to do anything — you must actively claim exemption.",
      "Assuming your landlord will handle it — they often do not know you are a student.",
      "Moving to a new address and not re-applying for exemption at the new property.",
    ],
    safetyWarning:
      "Council tax is a legal obligation. Always respond to any council correspondence, even if you believe you are exempt. Failure to respond can result in a court summons even for students.",
    sourceSignpost:
      "gov.uk/council-tax | gov.uk/guidance/council-tax-discounts#full-time-students | Citizens Advice: citizensadvice.org.uk",
    disclaimer:
      "SettleMap provides general information about council tax. This is not legal or tax advice.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_D7_006", "STU_D30_008"],
  },
  {
    slug: "student-status-letter",
    title: "How to Get Your Student Status Letter",
    category: "University",
    description: "What a student status letter is, why you need it, and how to request one from your university.",
    whatThisIs:
      "A practical guide to requesting and using official student status letters from your UK university.",
    whyItMatters:
      "A student status letter (sometimes called an enrolment letter, confirmation of student status letter, or university letter) is your official proof that you are a full-time student in the UK. Banks, letting agents, the council, and visa applications all commonly require this. Getting several copies early means you are not rushing to get one before a deadline.",
    whatToPrepare: [
      "Your student ID number",
      "The specific purpose of the letter (some banks and agencies have specific wording requirements)",
      "The address or organisation the letter should be addressed to",
    ],
    stepsToTake: [
      "Check your university student portal — some universities allow you to download a student status letter automatically.",
      "If not available online: email or visit your university's student services, registry, or international student support team.",
      "Specify the exact purpose of the letter — some agencies require specific wording.",
      "Request 2–3 copies at once so you have spares.",
      "Most universities issue these within 3–5 working days. Some charge a small fee.",
      "Check the letter carefully before using it — make sure your name, course, and dates are correct.",
    ],
    commonMistakes: [
      "Requesting one copy at a time — always request at least three.",
      "Not specifying the purpose — some banks and councils need the letter addressed to them specifically.",
    ],
    safetyWarning: undefined,
    sourceSignpost:
      "Your university's official website is the only source of truth for how to request a student status letter.",
    disclaimer:
      "SettleMap provides general administrative guidance. Check with your university for their specific student status letter process.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_D30_005", "STU_D30_001", "STU_D30_008"],
  },
  {
    slug: "sim-esim-guide",
    title: "UK SIM and eSIM Options for Students",
    category: "Local Life",
    description: "How to get a UK phone number — comparing SIM cards, eSIMs, and the best student deals.",
    whatThisIs:
      "A comparison of the different ways to get a UK phone number as an international student — traditional SIM cards vs eSIMs, and the best-value providers.",
    whyItMatters:
      "A UK phone number is one of the first things you need after arrival. Many UK services — especially banking, NHS, and delivery services — will only send verification codes to a UK number. Understanding your options before you travel means you can activate service immediately on arrival rather than being without a working phone for days.",
    whatToPrepare: [
      "Your current phone — check if it is SIM-locked to your home network",
      "Research on UK SIM and eSIM providers before you travel",
    ],
    stepsToTake: [
      "Check if your current phone is locked — if so, contact your home network to unlock it, or plan to use a UK SIM.",
      "Compare UK SIM-only plans: giffgaff, Lebara, Voxi, Smarty, and iD Mobile are popular choices among students.",
      "Consider an eSIM: you can buy and activate a UK eSIM plan before you travel, meaning you have UK data the moment you land.",
      "If you want a traditional SIM: buy one at the airport (more expensive) or from a high street shop.",
      "Choose a plan with adequate data — most students need 10–30GB per month.",
    ],
    commonMistakes: [
      "Arriving without any UK data plan and being unable to access maps or essential apps.",
      "Signing a long contract before comparing options — SIM-only plans are flexible and usually month-to-month.",
      "Not checking coverage at your specific accommodation address — mobile coverage varies significantly by location.",
    ],
    safetyWarning: undefined,
    sourceSignpost:
      "giffgaff: giffgaff.com | Lebara: lebara.com | Voxi: voxi.co.uk | Smarty: smarty.co.uk | Ofcom coverage checker: broadbandchecker.ofcom.org.uk",
    disclaimer:
      "SettleMap provides general guidance. Compare all providers and read terms before purchasing any SIM or eSIM plan.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_PRE_007", "STU_D1_005"],
  },
  {
    slug: "uk-transport-guide",
    title: "UK Transport — Student Discounts and How to Get Around",
    category: "Transport",
    description: "Public transport options in the UK, student discounts, and how to get around cheaply.",
    whatThisIs:
      "A practical guide to public transport in the UK for students — covering trains, buses, the London Underground (TfL), and the student discount cards available.",
    whyItMatters:
      "Transport is one of the biggest regular expenses for students in the UK. Getting the right discount card can save you 30–50% on every journey — which adds up to hundreds of pounds per year. Many students spend too much on transport because they do not know about the discounts available to them.",
    whatToPrepare: [
      "Your student ID card",
      "A passport photo (required for 18+ Student Oyster and 16–25 Railcard)",
      "A bank card for online purchases",
    ],
    stepsToTake: [
      "Apply for a 16–25 Railcard at 16-25railcard.co.uk — this saves 1/3 on all UK train tickets. Cost: £30 for 3 years (or £70 for 3 years with a 16-25 Railcard on your 18+ Oyster).",
      "If in London: apply for an 18+ Student Oyster photocard at tfl.gov.uk — gives 30% off bus and tube travel.",
      "Check if your university offers a discounted travel pass — many do.",
      "Use contactless bank card payment on buses and trains where possible — it is usually the cheapest option.",
      "Download the Trainline app to compare train prices and book in advance.",
    ],
    commonMistakes: [
      "Not carrying the Railcard when travelling — conductors can charge full price plus a penalty fare without it.",
      "Not activating student discounts on Oyster — the discount only applies once you are registered.",
      "Buying train tickets at the station without booking in advance — advance tickets are much cheaper.",
    ],
    safetyWarning: undefined,
    sourceSignpost:
      "16–25 Railcard: 16-25railcard.co.uk | 18+ Student Oyster: tfl.gov.uk/18plus | Trainline: thetrainline.com | National Express: nationalexpress.com",
    disclaimer:
      "SettleMap provides general transport guidance. Discount eligibility and prices change — check official provider websites for current information.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_PRE_004", "STU_D7_005"],
  },
  {
    slug: "first-month-budget",
    title: "Budget Planning for Your First Month",
    category: "Money",
    description: "How to plan your student budget for the first month in the UK — including one-off costs.",
    whatThisIs:
      "A practical budget planning guide for international students covering the first month in the UK, including one-off setup costs that most students forget to budget for.",
    whyItMatters:
      "Month one always costs more than subsequent months. Bedding, kitchenware, internet installation, and initial food shops add up to several hundred pounds — costs that are not visible in a standard monthly budget. Planning for these one-off costs means you do not run out of money in your first month.",
    whatToPrepare: [
      "Your expected income (student loan, family support, part-time work)",
      "Your rent amount and move-in date",
      "A list of one-off items you may need to buy",
    ],
    stepsToTake: [
      "List all one-off setup costs: bedding, kitchenware, internet installation, initial food shop, travel card, toiletries, books.",
      "List your fixed monthly costs: rent, utilities (if not in rent), phone, transport.",
      "Estimate variable costs: food, social, study materials.",
      "Set a total budget — total income minus fixed costs = your monthly discretionary budget.",
      "Track actual spending in your first month using your bank app.",
      "Adjust your budget for month two based on what you actually spent.",
    ],
    commonMistakes: [
      "Not budgeting for one-off setup costs in month one — these can be £500+.",
      "Not tracking spending in real time — it is easier to adjust your spending as you go than to deal with overspending at the end of the month.",
      "Setting too strict a social budget — complete isolation is bad for mental health.",
    ],
    safetyWarning: undefined,
    sourceSignpost:
      "MSE Student Budget Guide: moneysavingexpert.com | Money Helper: moneyhelper.org.uk",
    disclaimer:
      "SettleMap provides general financial guidance. This is not financial advice. Seek professional advice for significant financial decisions.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_PRE_005", "STU_D30_004", "STU_D90_001", "STU_D90_002", "STU_D90_008"],
  },
  {
    slug: "tenancy-documents",
    title: "Understanding Your Tenancy Agreement",
    category: "Accommodation",
    description: "What to look for in a UK tenancy agreement before you sign it.",
    whatThisIs:
      "A plain-English guide to reading and understanding a UK tenancy agreement — what the key clauses mean and what to watch out for.",
    whyItMatters:
      "Your tenancy agreement is a legally binding contract. It determines how much rent you pay, how long you are committed, what you are responsible for, and what your landlord can and cannot do. Not reading it — or not understanding it — can result in unexpected costs and disputes at the end of your tenancy.",
    whatToPrepare: [
      "Your tenancy agreement (read it before you sign)",
      "The Shelter tenancy checklist",
      "Time to read carefully — do not rush",
    ],
    stepsToTake: [
      "Read the entire agreement before signing — do not sign anything you have not read.",
      "Check: minimum tenancy length and notice period. Can you leave early if needed?",
      "Check: what deposits and fees apply. Are there any charges you were not told about?",
      "Check: who is responsible for repairs and bills. Are utilities included in rent?",
      "Check: what happens at the end of the tenancy. Is there a renewal process?",
      "Use Shelter's free tenancy agreement checker at shelterengland.org.",
      "Keep a copy of the signed agreement in your cloud storage.",
    ],
    commonMistakes: [
      "Signing a 12-month contract without knowing the exit terms — early termination can be expensive.",
      "Not noticing clauses about: quiet hours, guests, pets, redecorating, or using the property for business.",
      "Assuming the letting agent explained everything — always read it yourself.",
    ],
    safetyWarning: undefined,
    sourceSignpost:
      "Shelter England: shelterengland.org | Shelter Scotland: shelter.scot | Tenant Fees Act: gov.uk/guidance/tenant-fees-act | Citizens Advice: citizensadvice.org.uk",
    disclaimer:
      "This is general guidance, not legal advice. For legal advice, contact Shelter or a housing solicitor.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_D7_009", "STU_D30_007", "STU_D90_003"],
  },
  {
    slug: "deposit-protection",
    title: "Tenant Deposit Protection — Your Rights",
    category: "Accommodation",
    description: "How UK tenancy deposit protection works and how to make sure yours is safe.",
    whatThisIs:
      "A guide to understanding UK tenancy deposit protection schemes — your rights, how to check if your deposit is protected, and what to do if it is not.",
    whyItMatters:
      "Your tenancy deposit is typically 5 weeks' rent. If your landlord does not protect it in a government-approved scheme, they are breaking the law and you may be entitled to compensation of up to 3 times your deposit amount. This takes five minutes to check — and protects your money.",
    whatToPrepare: [
      "Your deposit amount and date paid",
      "Your tenancy agreement",
      "The deposit protection scheme used (TDS, DPS, or MyDeposits)",
    ],
    stepsToTake: [
      "Check your tenancy agreement to see which scheme your landlord said they would use.",
      "Log in to the scheme's portal to verify your deposit is protected and the amount is correct.",
      "Your landlord must protect the deposit within 30 days of receiving it — if they have not, they owe you compensation.",
      "At the end of your tenancy, the scheme will handle the dispute process if you and your landlord disagree on deductions.",
      "Save the scheme certificate and contact details.",
    ],
    commonMistakes: [
      "Not checking — many students do not know their deposit is unprotected until they try to claim it back.",
      "Assuming your landlord will protect it — they are legally required to but not all do.",
    ],
    safetyWarning:
      "If your deposit was not protected within 30 days, contact Shelter or a student housing advice service immediately. You may be entitled to compensation.",
    sourceSignpost:
      "TDS: tenancydepositscheme.com | DPS: depositprotection.com | MyDeposits: mydeposits.co.uk | Shelter: shelterengland.org",
    disclaimer:
      "SettleMap provides general information about deposit protection. For legal advice, contact Shelter or a qualified solicitor.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_D7_010", "STU_D90_003"],
  },
  {
    slug: "part-time-work-awareness",
    title: "Working While Studying in the UK",
    category: "Work",
    description: "Your rights, rules, and practical tips for part-time work as an international student.",
    whatThisIs:
      "A guide to part-time work as an international student in the UK — covering your visa work conditions, your employment rights, and how to find good work.",
    whyItMatters:
      "Part-time work can enrich your UK experience, help with living costs, and build your CV. But working too many hours can damage your studies, and some employers exploit international students who do not know their rights. Understanding both sides means you can work confidently and safely.",
    whatToPrepare: [
      "Your UKVI online account or passport with visa vignette (to check your work conditions)",
      "An understanding of your visa hour limits",
      "A UK-format CV",
    ],
    stepsToTake: [
      "Check your UKVI online account or passport with visa vignette for your work conditions — your visa endorsement states your specific hour limit. The standard Student Visa allows up to 20 hours per week during term time, but some visas allow 10 hours or have other restrictions. Always check your own visa conditions and your university's guidance.",
      "Know your rights: you are entitled to National Minimum Wage, sick pay, and holiday pay from day one.",
      "Get a National Insurance number as soon as possible if you plan to work (apply via DWP).",
      "Use your university careers service — they have exclusive job listings and can review your CV.",
      "Look for work related to your field — this builds your CV more than generic work.",
    ],
    commonMistakes: [
      "Working more hours than your visa allows — this can breach your visa conditions.",
      "Accepting cash-in-hand work — this is illegal and leaves you with no employment protections.",
      "Not disclosing that you are an international student — you must tell your employer your right-to-work status.",
    ],
    safetyWarning:
      "If your employer asks you to work off the books, refuses to give you a payslip, or deducts money from your wages, contact the Advisory, Conciliation and Arbitration Service (Acas) on 0300 123 1100.",
    sourceSignpost:
      "Home Office student visa work guidance: gov.uk/student-visa/work | Acas: acas.org.uk | National Minimum Wage: gov.uk/national-minimum-wage | DWP NI number: gov.uk/apply-national-insurance-number",
    disclaimer:
      "SettleMap provides general guidance on working as a student. This is not legal or immigration advice.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_D30_003", "STU_D30_006", "STU_D30_009", "STU_D90_005"],
  },
  {
    slug: "ni-number-basics",
    title: "National Insurance Number — What It Is and How to Apply",
    category: "Work",
    description: "What a National Insurance number is, why you need it, and how to get one.",
    whatThisIs:
      "A plain-English guide to the UK National Insurance (NI) number — what it is, who needs one, and the application process.",
    whyItMatters:
      "Your National Insurance number is your unique personal reference number for tax and National Insurance contributions in the UK. You legally need it to work — employers use it to make sure the correct tax and National Insurance is deducted from your wages. Without one, you could be taxed incorrectly or miss out on state pension contributions.",
    whatToPrepare: [
      "Proof of the right to work in the UK (passport with vignette and UKVI online account / eVisa)",
      "Proof of address",
      "Proof of student status",
    ],
    stepsToTake: [
      "If you have a pre-existing NI number from a previous UK stay, note it — you do not need to reapply.",
      "If you do not: call the DWP NI number helpline on 0300 200 3500.",
      "DWP will schedule an evidence interview — bring your passport and UKVI online account or eVisa.",
      "Your NI number will be posted to you within 3–4 weeks.",
      "Save your NI number securely — you will need it for every job and for your tax returns.",
    ],
    commonMistakes: [
      "Starting work without an NI number — you can start work before receiving it but must apply promptly.",
      "Losing the letter — NI numbers are posted once. If lost, you must request a replacement from HMRC.",
    ],
    safetyWarning: undefined,
    sourceSignpost:
      "HMRC NI number: gov.uk/apply-national-insurance-number | DWP: dwp.gov.uk",
    disclaimer:
      "SettleMap provides general guidance on National Insurance. For tax advice, contact HMRC or a qualified accountant.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_D30_003", "STU_D30_006"],
  },
  {
    slug: "right-to-work-share-code",
    title: "Your Right to Work in the UK as a Student",
    category: "Work",
    description: "Understanding your right to work conditions as an international student and how to prove it.",
    whatThisIs:
      "A guide to the right-to-work check process in the UK — what employers need to see, how to prove your status, and what to do if there are issues.",
    whyItMatters:
      "Employers are legally required to check that you have the right to work in the UK before hiring you. As an international student, your right to work is tied to your visa conditions. Understanding what employers need to see — and your rights in the process — prevents misunderstandings and discrimination.",
    whatToPrepare: [
      "UKVI online account / eVisa or passport with your visa vignette",
      "Your NI number (needed for PAYE tax)",
    ],
    stepsToTake: [
      "Know your work hour limit from your visa conditions — typically 20 hours per week during term time.",
      "Give your employer your UKVI online account or passport with visa vignette to check your right to work.",
      "If you have settled or pre-settled status under the EU Settlement Scheme, you may not need a visa — check with your employer.",
      "Your employer will use the Home Office online right-to-work checking service.",
      "You do not need to share your immigration status with your employer beyond what is needed for the right-to-work check.",
    ],
    commonMistakes: [
      "Working more hours than your visa allows — this is a breach of your visa conditions.",
      "Not telling your employer you are an international student — they must run the right-to-work check.",
    ],
    safetyWarning:
      "If an employer discriminates against you based on your nationality or immigration status, contact the Equality Advisory and Support Service (EASS) on 0808 800 0082.",
    sourceSignpost:
      "Home Office right-to-work checks: gov.uk/prove-right-to-work | Employer guidance: gov.uk/guidance/employers-right-to-work-checks",
    disclaimer:
      "SettleMap provides general guidance on right-to-work. For immigration advice, consult a qualified immigration solicitor.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_D30_003", "STU_D30_006", "STU_D30_009"],
  },
  {
    slug: "job-scam-warning",
    title: "Job and Employment Scam Warning",
    category: "Safety",
    description: "How to spot job scams targeting international students and what to do if you have been targeted.",
    whatThisIs:
      "An updated guide to the most common job and employment scams targeting international students in the UK — and how to protect yourself.",
    whyItMatters:
      "International students are disproportionately targeted by job scams because scammers know students need money, may be unfamiliar with the UK job market, and may be more willing to take risks. Job scams can result in financial loss, identity theft, and — if you are found to have worked illegally — visa problems.",
    whatToPrepare: [
      "An understanding of the red flags listed below",
      "Knowledge that legitimate UK employers do not charge recruitment fees",
    ],
    stepsToTake: [
      "Always research the employer before applying — check their website, reviews, and Companies House registration.",
      "Verify job offers through official channels — call the company on their publicly listed number, not a number provided by the recruiter.",
      "Never pay money to get a job — this is always a scam.",
      "Never share your passport, UKVI account details, or bank details unless you are certain the employer is legitimate.",
      "If you are asked to receive money into your bank account and forward it elsewhere — this is money laundering. Refuse and report it.",
      "Report suspected scams to Action Fraud on 0300 123 2040.",
    ],
    commonMistakes: [
      "Accepting a job that asks for an upfront fee — legitimate employers never charge to hire someone.",
      "Being pressured to accept quickly — scammers create urgency to stop you thinking clearly.",
      "Sharing banking login details — no legitimate employer needs your online banking access.",
    ],
    safetyWarning:
      "If you have transferred money to a suspected scammer, contact your bank immediately. If you have shared identity documents, contact the police and Action Fraud. If your visa status has been compromised, contact a qualified immigration solicitor immediately.",
    sourceSignpost:
      "Action Fraud: actionfraud.police.uk | Take Five to Stop Fraud: takefive-stopfraud.org.uk | Citizens Advice Employment: citizensadvice.org.uk/employment",
    disclaimer:
      "SettleMap provides general guidance on job scams. This is not legal advice. If you have been a victim of fraud, contact Action Fraud and your bank immediately.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_D30_006", "STU_D30_009", "STU_D90_005"],
  },
  {
    slug: "emergency-contacts",
    title: "Emergency Contacts and Where to Get Help",
    category: "Safety",
    description: "The essential emergency contacts every international student in the UK should know.",
    whatThisIs:
      "A reference card of essential emergency contacts for international students in the UK — covering police, health, fraud, housing, and university support.",
    whyItMatters:
      "In an emergency, you do not have time to search for phone numbers. Saving these contacts in your phone before you need them — and knowing which one to call for your specific situation — can make a critical difference.",
    whatToPrepare: [
      "Your phone with these contacts saved",
      "Your university's emergency and out-of-hours support numbers",
    ],
    stepsToTake: [
      "Save the UK Emergency Services number (999) in your phone contacts.",
      "Save the NHS 111 number (non-emergency medical help).",
      "Save the Police non-emergency number (101).",
      "Save Action Fraud (0300 123 2040) for scam reporting.",
      "Save your university's international student support and accommodation emergency numbers.",
      "Save the Citizens Advice number (0800 144 8848 for England, or 0800 022 2034 for Scotland).",
    ],
    commonMistakes: [
      "Calling 999 for non-emergencies — this blocks emergency lines for people in genuine danger.",
      "Not knowing your university's out-of-hours support number — many problems happen outside office hours.",
    ],
    safetyWarning:
      "In any life-threatening emergency — to yourself or others — call 999 immediately. If you are unsure whether something is an emergency, call 111.",
    sourceSignpost:
      "999 — Emergency (police, ambulance, fire) | 111 — NHS non-emergency | 101 — Police non-emergency | Action Fraud: 0300 123 2040 | Samaritans: 116 123 (free) | Mind (mental health): 0300 123 3393",
    disclaimer:
      "SettleMap provides general emergency contact information. Always use official emergency services for genuine emergencies.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_D1_001", "STU_D1_002"],
  },
  {
    slug: "90-day-review",
    title: "Your 90-Day Settlement Review",
    category: "Growth",
    description: "A structured self-review for the end of your first 90 days in the UK.",
    whatThisIs:
      "A practical self-review guide for international students at the 90-day mark — covering what to reflect on, what to check, and what to plan next.",
    whyItMatters:
      "The first 90 days are intense — full of admin tasks, cultural adjustment, and new experiences. Taking time to reflect at the 90-day mark helps you see what is going well, what needs attention, and where you want to focus in the next phase of your time in the UK.",
    whatToPrepare: [
      "Your SettleMap checklist progress",
      "Notes from your first weeks",
      "A blank document or notebook",
    ],
    stepsToTake: [
      "Open your SettleMap checklist — how many of your 90-day tasks are complete?",
      "Write down your three biggest achievements in the first 90 days.",
      "Write down the one or two things that are still causing you stress or uncertainty.",
      "Identify any outstanding admin tasks — go to your checklist and check.",
      "Identify your three most important connections in the UK.",
      "Write down one or two things you want to achieve in the next 90 days.",
      "Share your review with a trusted person — a family member, friend, or mentor.",
    ],
    commonMistakes: [
      "Only focusing on what is going wrong — celebrating wins matters for motivation.",
      "Not updating your checklist — by day 90, most tasks should be complete.",
      "Not asking for help with ongoing problems — university support services exist for exactly this.",
    ],
    safetyWarning: undefined,
    sourceSignpost:
      "SettleMap guidance library: guides | Your university student support | Citizens Advice: citizensadvice.org.uk",
    disclaimer:
      "SettleMap provides general settlement guidance. This is not professional advice. Seek support from qualified professionals for health, legal, immigration, or financial concerns.",
    lastReviewed: "May 2026",
    relatedTaskIds: ["STU_D90_001", "STU_D90_002", "STU_D90_003", "STU_D90_004", "STU_D90_005", "STU_D90_006", "STU_D90_007", "STU_D90_008", "STU_D90_009", "STU_D90_010"],
  },
];
