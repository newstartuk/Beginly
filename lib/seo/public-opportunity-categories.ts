import type { OpportunityCategory } from "@/lib/platform/types";

export interface PublicOpportunityCategory {
  slug: string;
  category: OpportunityCategory;
  title: string;
  summary: string;
  trustChecks: string[];
  sourceIds: string[];
  reviewDate: string;
}

export const PUBLIC_OPPORTUNITY_CATEGORIES: PublicOpportunityCategory[] = [
  { slug: "jobs-and-careers", category: "job", title: "Jobs and career opportunities", summary: "Role-aware employment opportunities, preparation actions and sponsorship-conscious career signals.", trustChecks: ["Provider identity", "Closing date", "Location and route relevance", "No commission ranking advantage"], sourceIds: ["gov-sponsor-list", "beginly-career"], reviewDate: "2026-10-01" },
  { slug: "training-and-certification", category: "training", title: "Training and certification", summary: "Courses, certifications and skills programmes assessed for relevance, cost transparency and provider trust.", trustChecks: ["Provider and qualification claims", "Price and refund clarity", "Outcome relevance", "Commercial disclosure"], sourceIds: ["beginly-career", "beginly-methodology"], reviewDate: "2026-10-01" },
  { slug: "events-and-networks", category: "event", title: "Events and professional networks", summary: "Professional events, community sessions and networks that can advance integration, confidence and opportunity access.", trustChecks: ["Organiser identity", "Event date and venue", "Accessibility and cost", "Safety reporting path"], sourceIds: ["beginly-network", "beginly-methodology"], reviewDate: "2026-10-01" },
  { slug: "founder-and-funding", category: "accelerator", title: "Founder, accelerator and funding opportunities", summary: "Founder programmes and evidence-building opportunities filtered for stage, geography, credibility and application readiness.", trustChecks: ["Programme operator", "Eligibility and deadline", "Funding or fee terms", "Evidence and application fit"], sourceIds: ["beginly-founder", "beginly-methodology"], reviewDate: "2026-10-01" },
  { slug: "family-and-community", category: "family", title: "Family and community opportunities", summary: "Local and national support for family settlement, schools, wellbeing, participation and community connection.", trustChecks: ["Public or verified community source", "Local applicability", "Safeguarding boundary", "No sensitive-context exploitation"], sourceIds: ["gov-family", "local-authority", "beginly-family"], reviewDate: "2026-10-01" },
];

export function getPublicOpportunityCategory(slug: string) {
  return PUBLIC_OPPORTUNITY_CATEGORIES.find((item) => item.slug === slug);
}
