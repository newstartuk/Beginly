import type { ScamAlert } from "@/types";

export const SCAM_ALERTS: ScamAlert[] = [
  {
    id: "housing-deposit-scam",
    title: "⚠️ Fake landlord deposits — a major spike in September",
    body: "Scammers post fake accommodation listings at very low prices, ask for a deposit before you have seen the property, and disappear. Red flags: price is too good to be true, landlord says they are abroad and cannot meet you, asks for payment via wire transfer (Western Union, MoneyGram, bank transfer). What to do: never transfer money before seeing the property in person or via verified video call. Use university-accredited landlords. If you have been targeted, contact Action Fraud: 0300 123 2040.",
    category: "Housing",
    severity: "high",
  },
  {
    id: "job-guaranteed-employment",
    title: "⚠️ Job placement scams — 'guaranteed employment' is a lie",
    body: "Scammers target international students with offers of 'guaranteed part-time work' or 'placement schemes' for a fee. They may use fake company names and professional-looking websites. Red flags: fee required upfront, guaranteed job offer, company you cannot find in Companies House, they ask for your passport or bank details. What to do: never pay for a job. Verify the employer through official channels. Report to Action Fraud: 0300 123 2040.",
    category: "Jobs",
    severity: "high",
  },
  {
    id: "fake-official-letters",
    title: "⚠️ Fake official letters — HMRC, bank, and council scams",
    body: "Scammers send emails or letters pretending to be from HMRC, your bank, UKVI, or the council — claiming you owe money, need to verify your details, or have a refund. Red flags: unexpected contact, threatening language, links to fake websites, requests for personal information or bank details. What to do: never click links in unexpected emails. Verify by calling the official number on the organisation's official website. HMRC will never ask for personal bank details by email.",
    category: "Documents",
    severity: "high",
  },
  {
    id: "document-phishing",
    title: "⚠️ Document phishing — fake eVisa and visa renewal emails",
    body: "Emails or texts claiming to be from UKVI or the Home Office, asking you to 'verify your eVisa details', 'renew your visa', or 'update your immigration status'. They link to fake government websites designed to steal your personal information. Red flags: unexpected contact, urgency ('your visa will be cancelled within 48 hours'), links to non-gov.uk websites. What to do: the Home Office will never contact you by email about your visa. Report phishing to the National Cyber Security Centre: report.ncsc.gov.uk.",
    category: "Documents",
    severity: "medium",
  },
  {
    id: "too-good-accommodation",
    title: "⚠️ Too-good-to-be-true accommodation deals",
    body: "Rental properties advertised at significantly below-market prices — usually because they do not exist. The scammer uses stolen photos from real listings, communicates quickly to pressure you, and asks for a deposit before you have met or viewed. Red flags: price is 30%+ below comparable properties, only available through one channel, landlord is in a hurry to 'secure' the property. What to do: compare prices on Rightmove and Zoopla. Always view the property in person or via video call with the agent present. Never transfer money without a proper tenancy agreement.",
    category: "Housing",
    severity: "high",
  },
  {
    id: "people-offering-help",
    title: "⚠️ 'I'll help you' — people offering to help for a fee",
    body: "Someone — often claiming to be a student, a helper, or an 'agent' — offers to help you with university admin, bank accounts, accommodation, or job applications in exchange for an upfront fee. Sometimes they claim to have 'special relationships' with universities or banks. Red flags: upfront payment required, no verifiable credentials, pressure to decide quickly, vague about exactly what they will do. What to do: no one with a 'special relationship' will cold-approach you. Use official university and government services — they are free. Report to Action Fraud.",
    category: "General",
    severity: "medium",
  },
];

export function getScamAlertsByCategory(category: string): ScamAlert[] {
  return SCAM_ALERTS.filter((a) => a.category.toLowerCase() === category.toLowerCase());
}

export function getAllScamAlerts(): ScamAlert[] {
  return SCAM_ALERTS;
}
