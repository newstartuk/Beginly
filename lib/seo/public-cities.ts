export interface PublicCityGuide {
  slug: string;
  name: string;
  title: string;
  summary: string;
  answer: string;
  usefulFor: string[];
  preparationAreas: string[];
  reviewedAt: string;
  nextReviewAt: string;
}

export const PUBLIC_CITIES: PublicCityGuide[] = [
  { slug: "london", name: "London", title: "Beginly city guidance for London", summary: "Adaptive settlement and opportunity preparation for users living, studying, working or building a household in London.", answer: "Beginly uses London as a location context for relevant journeys and opportunities while avoiding unsupported claims about local availability.", usefulFor: ["Transport and local-area planning", "University and career opportunity context", "Household and childcare preparation"], preparationAreas: ["Confirm borough and travel radius", "Review trusted local-service sources", "Set opportunity distance preferences"], reviewedAt: "2026-07-12", nextReviewAt: "2026-09-12" },
  { slug: "manchester", name: "Manchester", title: "Beginly city guidance for Manchester", summary: "Route-aware actions and opportunity context for Manchester users without forcing a city-specific account or plan.", answer: "Beginly combines national route guidance with reviewed Manchester context and user-controlled location preferences.", usefulFor: ["Local service orientation", "Study and graduate transition", "Professional and community opportunities"], preparationAreas: ["Confirm travel radius", "Review current provider sources", "Keep location consent under your control"], reviewedAt: "2026-07-12", nextReviewAt: "2026-09-12" },
  { slug: "birmingham", name: "Birmingham", title: "Beginly city guidance for Birmingham", summary: "Practical city context for settlement, education, employment readiness and family progression.", answer: "Beginly can prioritise Birmingham-relevant actions and opportunities while keeping national official guidance clearly distinguished from local signposting.", usefulFor: ["Family and settlement coordination", "Career readiness", "Education and professional networks"], preparationAreas: ["Record current area", "Set commute preferences", "Review source dates before acting"], reviewedAt: "2026-07-12", nextReviewAt: "2026-09-12" },
  { slug: "leeds", name: "Leeds", title: "Beginly city guidance for Leeds", summary: "Reviewed city context connected to the same continuing Beginly identity, journey and opportunity model.", answer: "Beginly uses Leeds context to improve relevance without treating location as a permanent or exclusive route.", usefulFor: ["Study and graduate planning", "Employment opportunity context", "Community and household actions"], preparationAreas: ["Confirm location preferences", "Save relevant opportunities", "Check review dates and official sources"], reviewedAt: "2026-07-12", nextReviewAt: "2026-09-12" },
];

export function getPublicCity(slug: string): PublicCityGuide | undefined {
  return PUBLIC_CITIES.find((city) => city.slug === slug);
}
