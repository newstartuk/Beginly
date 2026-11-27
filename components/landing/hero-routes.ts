import type { ArrivalType, TaskStage } from "@/types";

/** The visa routes visitors can pick on the landing page. */
export type HeroRoute = "student" | "worker" | "family" | "graduate" | "founder" | "health";

/** The order the routes appear in. */
export const HERO_ROUTE_ORDER: HeroRoute[] = ["student", "worker", "family", "graduate", "founder", "health"];

/** Button labels for each route. */
export const HERO_ROUTE_LABEL: Record<HeroRoute, string> = {
  student: "Student",
  worker: "Skilled Worker",
  family: "Family and Dependant",
  graduate: "Graduate",
  founder: "Founder",
  health: "Health & Care",
};

/** Each route's name in the checklist data (lib/seed-data.ts). */
export const HERO_ROUTE_ARRIVAL_TYPE: Record<HeroRoute, ArrivalType> = {
  student: "international_student",
  worker: "skilled_worker",
  family: "family_visa",
  graduate: "graduate",
  founder: "founder",
  health: "health_and_care",
};

/** One stage of the landing page timeline, with the task titles to show. */
export type TimelinePhase = { stage: TaskStage; label: string; tasks: string[] };
