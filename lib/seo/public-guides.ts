export interface PublicGuide {
  slug: string;
  title: string;
  summary: string;
  answer: string;
  sections: Array<{ heading: string; body: string; actions?: string[] }>;
  sourceIds: string[];
  audiences: string[];
  reviewedAt: string;
  nextReviewAt: string;
  owner: string;
  adviceBoundary: string;
}

export const PUBLIC_GUIDES: PublicGuide[] = [
  {
    slug: "settling-essentials",
    title: "UK settling essentials",
    summary: "Identity, health registration, local services and practical first actions for a safer start.",
    answer: "Beginly organises settling actions into an adaptive journey and points users to official sources without deciding individual legal status.",
    sections: [
      { heading: "Start with identity and access", body: "Keep your identity records, contact details and trusted account access organised. Use official channels for any status-specific question.", actions: ["Confirm your profile details", "Record the city where you currently live", "Save official-source links"] },
      { heading: "Register for essential services", body: "Health, local-government and practical-service steps vary by circumstance and location. Beginly prioritises the relevant actions and shows the source and review date." },
      { heading: "Prepare for the next stage", body: "Settlement should not become a dead end. Beginly progressively introduces study, career, family and opportunity preparation as those needs become relevant." },
    ],
    sourceIds: ["gov-arrival", "nhs-registration", "beginly-methodology"],
    audiences: ["New UK arrivals", "International students", "Workers and families"],
    reviewedAt: "2026-07-12",
    nextReviewAt: "2026-10-12",
    owner: "Beginly Content Operations",
    adviceBoundary: "General organisational guidance only. Use official or regulated services for decisions about individual legal status.",
  },
  {
    slug: "study-to-graduate-transition",
    title: "Study and graduate transition",
    summary: "Academic readiness, career preparation and future-horizon planning before graduation becomes urgent.",
    answer: "Beginly helps students preserve their journey history while career and graduate-readiness actions gradually become more prominent.",
    sections: [
      { heading: "Do not restart at graduation", body: "Your existing identity, goals, household context, completed actions and preferences should remain available as your primary route and dashboard emphasis evolve." },
      { heading: "Build readiness early", body: "CV, interview, opportunity and sponsorship-awareness gaps can be surfaced before the final study period, while free capabilities remain available without an upgrade wall." },
      { heading: "Use the smallest sufficient support", body: "A focused standalone product may be more appropriate than a broad subscription. Nia checks free, owned and sponsored access first." },
    ],
    sourceIds: ["gov-graduate", "beginly-product-catalogue", "beginly-methodology"],
    audiences: ["International students", "Recent graduates", "Career changers"],
    reviewedAt: "2026-07-12",
    nextReviewAt: "2026-10-12",
    owner: "Beginly Content Operations",
    adviceBoundary: "Beginly supports preparation and source navigation; it does not provide personal immigration advice or guarantee an outcome.",
  },
  {
    slug: "work-and-sponsorship-awareness",
    title: "Work and sponsorship awareness",
    summary: "Prepare credible career evidence and questions while keeping official guidance and regulated-advice boundaries visible.",
    answer: "Beginly can organise work-readiness and sponsorship-awareness tasks, but it does not determine personal eligibility or promise sponsorship.",
    sections: [
      { heading: "Separate career readiness from legal conclusions", body: "You can improve role fit, evidence, CV quality, interview readiness and employer research without treating those actions as a legal-status determination." },
      { heading: "Check opportunity trust", body: "Beginly records provider, source, review date, destination health and commercial disclosure before presenting an opportunity for action." },
      { heading: "Escalate appropriately", body: "When a question requires a personal legal conclusion, Nia should help prepare facts and questions for an authorised professional rather than inventing an answer." },
    ],
    sourceIds: ["gov-immigration", "regulated-adviser-directory", "beginly-action-policy"],
    audiences: ["Graduates", "Skilled Workers", "Health and Care professionals"],
    reviewedAt: "2026-07-12",
    nextReviewAt: "2026-09-12",
    owner: "Beginly Trust and Content Operations",
    adviceBoundary: "No legal or immigration advice. Official guidance and regulated professionals remain authoritative for individual cases.",
  },
  {
    slug: "family-coordination",
    title: "Family and household coordination",
    summary: "Coordinate shared tasks while preserving private adult workspaces and age-appropriate visibility.",
    answer: "Beginly combines household actions with member-specific permissions so one family plan does not erase individual privacy.",
    sections: [
      { heading: "Shared does not mean universally visible", body: "School, local-service and household reminders may be shared, while private career, support and document activity remains restricted to the authorised member." },
      { heading: "Assign responsibility clearly", body: "Shared actions should show an owner, due date and status. Access changes and primary-household transfers should remain auditable." },
      { heading: "Let each member progress", body: "A spouse may use Career Pro while the main applicant uses Opportunity Radar Premium and the household shares Family Workspace." },
    ],
    sourceIds: ["beginly-household-policy", "beginly-entitlements", "beginly-methodology"],
    audiences: ["Families", "Partners and spouses", "Households with dependants"],
    reviewedAt: "2026-07-12",
    nextReviewAt: "2026-10-12",
    owner: "Beginly Product and Trust Operations",
    adviceBoundary: "Household coordination is not a substitute for professional safeguarding, legal or clinical support.",
  },
];

export function getPublicGuide(slug: string): PublicGuide | undefined {
  return PUBLIC_GUIDES.find((guide) => guide.slug === slug);
}
