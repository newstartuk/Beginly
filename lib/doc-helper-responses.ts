import type { DocType, DocHelperResponse } from "@/types";

const RESPONSES: Record<DocType, DocHelperResponse> = {
  tenancy_agreement: {
    plainEnglish:
      "A tenancy agreement is a contract between you (the tenant) and your landlord. It sets out: how much rent you pay and when; how long the tenancy lasts (the 'term'); who is responsible for repairs and bills; what you can and cannot do in the property; and how the tenancy can be ended. Most student tenancies in the UK are 'assured shorthold tenancies' (ASTs), which give landlords certain rights to reclaim the property at the end of the term. As a tenant, you have significant legal rights — including the right to live in the property without interference, the right to have repairs done, and the right to get your deposit back if you leave the property in good condition.",
    missingFields: [
      "Your full name and the landlord's full name and address",
      "The property address",
      "The start date and end date of the tenancy",
      "The monthly rent amount and which bank account to pay it to",
      "The deposit amount and which deposit protection scheme holds it",
      "Which bills are included in the rent",
      "The notice period (how much notice either side must give to end the tenancy)",
      "A list of any items included in the rent (white goods, furniture, etc.)",
    ],
    keyTerms: [
      { term: "Assured Shorthold Tenancy (AST)", meaning: "The most common type of tenancy in England and Wales. It gives you the right to live in the property for the tenancy term, and your landlord must use a court process to evict you. You have strong rights." },
      { term: "Tenancy Deposit", meaning: "Money you pay upfront as security. By law, your landlord must protect it in a government-approved scheme within 30 days. You should get it back at the end of the tenancy minus any legitimate deductions." },
      { term: "Break Clause", meaning: "A clause in your tenancy agreement that allows either you or the landlord to end the tenancy early under specific conditions. Not all tenancy agreements have one." },
      { term: "Notice Period", meaning: "The amount of notice you must give (usually 1 month) to leave the property. This is different from the tenancy end date." },
      { term: "Inventory", meaning: "A written record of the condition and contents of the property at the start of the tenancy. You should check and sign it carefully — it is used at the end to assess any damage." },
    ],
    safeNextSteps: [
      "Read the entire agreement before signing — do not rush this.",
      "Use Shelter's free tenancy agreement checker at shelterengland.org.",
      "Check that the deposit will be protected in a government-approved scheme (TDS, DPS, or MyDeposits).",
      "Take timestamped photos of the property on move-in day.",
      "Get a copy of the signed agreement and save it securely.",
      "Confirm in writing anything discussed verbally with the landlord before signing.",
    ],
  },
  council_tax_letter: {
    plainEnglish:
      "A council tax letter is a bill from your local council for the local services they provide — including bin collection, local roads, libraries, and street lighting. The amount is based on the 'band' your property is assigned to (bands A-H, with lower bands paying less). As a full-time student, you are entitled to a full council tax exemption — you do not have to pay it. Your university must provide you with a student status letter to prove this. If you receive a council tax bill, do not ignore it — you need to write to the council with your student status letter to claim the exemption.",
    missingFields: [
      "Your full name and the property address",
      "Your student status letter from your university (on headed paper, with your name, course, and expected completion date)",
      "Your National Insurance number (the council will ask for this)",
      "Evidence that the tenancy is in your name",
    ],
    keyTerms: [
      { term: "Council Tax Band", meaning: "Your property is assigned one of eight bands (A-H) based on its value. Lower bands pay less council tax. Bands are set by the Valuation Office Agency, not by the council." },
      { term: "Student Exemption", meaning: "Full-time students are exempt from council tax. You must apply to your council with a student status letter — it is not automatic." },
      { term: "Liability Date", meaning: "The date from which you become responsible for council tax at a property. This is usually the date you move in, not the date you sign the tenancy." },
      { term: "HC2 Certificate", meaning: "A certificate from the NHS that proves you qualify for free prescriptions, dental care, and eye tests. It is not related to council tax." },
    ],
    safeNextSteps: [
      "Find your local council at gov.uk/find-your-local-council.",
      "Download or request a student council tax exemption form from your council's website.",
      "Attach your student status letter and send it to the council in writing.",
      "Keep copies of all correspondence.",
      "If you receive a bill in error, respond in writing immediately — do not ignore it.",
      "Re-apply for the exemption at the start of each academic year.",
    ],
  },
  student_status_letter: {
    plainEnglish:
      "A student status letter (also called an enrolment letter or confirmation of student status letter) is an official letter from your university confirming that you are a full-time student. It is not the same as your student ID card — it is a formal document that organisations often require before providing services or discounts. Banks need it to open a student account. The council needs it to apply for council tax exemption. Letting agents may need it as part of referencing. You usually request it from your university's student services, registry, or through the student portal. Most universities issue it within 3–5 working days, and some charge a small fee.",
    missingFields: [
      "Your full name as it appears on your passport and university records",
      "Your student ID number",
      "Your course title and level of study (undergraduate, postgraduate, etc.)",
      "Your expected start and end dates of your course",
      "Your university's name and official stamp or letterhead",
      "The name of the organisation the letter should be addressed to (e.g. 'To whom it may concern' or a specific bank name)",
    ],
    keyTerms: [
      { term: "CAS (Confirmation of Acceptance for Studies)", meaning: "This is different from a student status letter — it is the document issued by your university that you used to apply for your student visa. It is not used for general purpose student status confirmation." },
      { term: " matriculation", meaning: "The formal process of becoming a registered student of a university. Some universities require you to attend a matriculation ceremony or complete online steps before you are officially enrolled." },
      { term: "Student Finance", meaning: "Student Finance England, Scotland, Wales, or Northern Ireland — the government body that administers student loans and grants. They are different from your university." },
    ],
    safeNextSteps: [
      "Check your university student portal first — some allow you to download a student status letter automatically.",
      "If not available online: email or visit your university's student services or registry.",
      "Request 2–3 copies at once so you have spares.",
      "Specify the exact purpose and whether the letter needs to be addressed to a specific organisation.",
      "Check the letter carefully before using it — confirm your name, dates, and course are correct.",
    ],
  },
  bank_letter: {
    plainEnglish:
      "A bank letter is a letter from your UK bank confirming your identity, address, and account status. Banks can provide this in different formats — a standard letter on bank letterhead, a printed statement with a bank stamp, or a letter specifically addressed to a third party (such as a letting agent or employer). Different organisations ask for different formats. Check what they need before requesting the letter — you may not need a formal letter at all.",
    missingFields: [
      "Your full name as it appears on your bank account",
      "Your account number and sort code",
      "The date the letter was issued",
      "The bank's name, address, and contact details",
      "A statement that the account is active and in good standing (if required by the requesting organisation)",
      "A bank stamp or signature — some organisations require this",
    ],
    keyTerms: [
      { term: "Bank Statement", meaning: "A document showing all transactions on your account over a period of time. Most banks provide this through their app or online banking. It can serve as proof of address — check what your organisation accepts." },
      { term: "Account Confirmation Letter", meaning: "A letter from your bank confirming your account details. Some banks call this a 'banker's letter' or 'reference letter'." },
      { term: "Sort Code", meaning: "A 6-digit code that identifies your bank and branch. You can find it on your bank card, in your banking app, or on your bank's website." },
      { term: "Current Account", meaning: "A bank account used for day-to-day transactions. Student current accounts are designed for students and often include an interest-free overdraft." },
    ],
    safeNextSteps: [
      "Check exactly what format your bank letter needs to be in — ask the organisation requesting it.",
      "Most banks allow you to download or print account summaries from their app — this is often sufficient as proof of address.",
      "If a formal letter is needed: visit a branch in person, call your bank's customer service line, or use the bank's secure messaging service in your app.",
      "Most banks issue account letters within 3–5 working days.",
      "Some banks charge for formal reference letters — check before requesting.",
    ],
  },
  nhs_registration_form: {
    plainEnglish:
      "The NHS GP registration form (called a GMS1 form) is the form you fill in to register with a NHS General Practitioner (GP, or family doctor). Registration with a GP is free and gives you access to NHS healthcare. You do not need to provide ID or proof of address to register — the NHS says anyone can register with a GP surgery regardless of immigration status. Once registered, you get an NHS number, which is your unique reference in the NHS system. You can register with any GP surgery that has space for new patients.",
    missingFields: [
      "Your full name, date of birth, and gender",
      "Your UK address (use your accommodation address, even if you are not sure how long you will be there)",
      "Your previous address in your home country",
      "Your NHS number if you have one already (find it at nhs.uk/nhs-services/nhs-number or your UKVI account)",
      "Details of any ongoing medical conditions, medications, or allergies",
      "The name and address of your previous GP (if you had one in the UK)",
      "Emergency contact details",
    ],
    keyTerms: [
      { term: "GP (General Practitioner)", meaning: "A family doctor — the first point of contact for most health issues in the UK. GP services are free on the NHS." },
      { term: "NHS Number", meaning: "Your unique 10-digit reference number in the NHS. You are assigned one when you register with a GP. Keep it noted — you will need it for prescriptions, referrals, and medical records." },
      { term: "GMS1 Form", meaning: "The standard registration form for NHS GP services. Available from any GP surgery or online at nhs.uk." },
      { term: "A&E (Accident and Emergency)", meaning: "Hospital emergency departments — for serious and life-threatening emergencies only. Not for routine health issues." },
      { term: "Prescription", meaning: "A written instruction from a doctor for medication. As of 2024, NHS prescriptions cost £9.90 per item unless you qualify for free prescriptions (full-time students on a low income can apply for an HC2 certificate)." },
    ],
    safeNextSteps: [
      "Find a GP surgery near your accommodation: nhs.uk/service-search/find-a-gp.",
      "Call or visit your top choices to check they are accepting new patients.",
      "Fill in the GMS1 form (available from the surgery or at nhs.uk).",
      "Submit the form in person or by post — most surgeries accept emailed scans.",
      "You do not need to show ID or proof of address — this is your right under NHS guidelines.",
      "Your NHS number will be posted to you within 2–3 weeks.",
      "Download the NHS App to manage appointments and prescriptions online.",
    ],
  },
};

export function getDocHelperResponse(docType: string): DocHelperResponse {
  if (docType && RESPONSES[docType as DocType]) {
    return RESPONSES[docType as DocType];
  }
  return {
    plainEnglish: "I don't have a pre-written explanation for that document type yet. In general, always read any document carefully before signing, keep copies, and ask questions if anything is unclear. For specific advice about a legal, immigration, financial, or medical document, contact a qualified professional.",
    missingFields: [],
    keyTerms: [],
    safeNextSteps: [
      "Read the document in full before signing or acting on it.",
      "Ask the organisation that issued the document to explain anything you do not understand.",
      "If it is a legal document, consider seeking advice from Citizens Advice or a qualified solicitor.",
      "If it involves money or a financial commitment, do not feel pressured to sign immediately.",
    ],
  };
}

export function getAvailableDocTypes(): { type: DocType; label: string; desc: string }[] {
  return [
    {
      type: "tenancy_agreement",
      label: "Tenancy Agreement",
      desc: "Renting a property — what you are signing up for",
    },
    {
      type: "council_tax_letter",
      label: "Council Tax Letter",
      desc: "A bill or notice from your local council",
    },
    {
      type: "student_status_letter",
      label: "Student Status Letter",
      desc: "University confirmation of your student status",
    },
    {
      type: "bank_letter",
      label: "Bank Letter",
      desc: "Letter from your bank confirming your account",
    },
    {
      type: "nhs_registration_form",
      label: "NHS GP Registration Form",
      desc: "Registering with a UK family doctor",
    },
    {
      type: "other",
      label: "Other Document",
      desc: "A document type that does not fit the main presets yet",
    },
  ];
}
