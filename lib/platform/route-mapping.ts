import type { ArrivalType } from "@/types";
import type { MigrationRoute } from "./types";

// The seed-data settlement task library (lib/seed-data.ts) is keyed by ArrivalType.
// The adaptive platform layer (journey.ts, context.ts) is keyed by MigrationRoute.
// This is the single, shared mapping between the two — previously duplicated inline
// inside context.ts with no inverse, which is how legacy-checklist.ts ended up only
// ever recognising the student route.

export function arrivalTypeToRoute(arrivalType: string): MigrationRoute {
  switch (arrivalType) {
    case "international_student": return "student";
    case "skilled_worker": return "skilled_worker";
    case "family_visa": return "family_dependant";
    case "graduate": return "graduate";
    case "global_talent": return "global_talent";
    case "health_and_care": return "health_care";
    case "founder": return "founder";
    default: return "student";
  }
}

// Inverse of arrivalTypeToRoute. Returns undefined for routes with no ArrivalType
// equivalent — currently just "humanitarian", which has no seed-data task library
// and is deliberately routed to human support instead.
export function routeToArrivalType(route: MigrationRoute): ArrivalType | undefined {
  switch (route) {
    case "student": return "international_student";
    case "skilled_worker": return "skilled_worker";
    case "family_dependant": return "family_visa";
    case "graduate": return "graduate";
    case "global_talent": return "global_talent";
    case "health_care": return "health_and_care";
    case "founder": return "founder";
    default: return undefined;
  }
}
