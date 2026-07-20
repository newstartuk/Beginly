import { SEED_TASKS } from "@/lib/seed-data";
import type { ArrivalProfile, Task, UserTask } from "@/types";

export type DbArrivalProfile = {
  arrival_type?: string | null;
  status?: string | null;
  arrival_date?: string | null;
  city?: string | null;
  university?: string | null;
  accommodation?: string | null;
  nationality?: string | null;
  english_level?: string | null;
  work_interest?: boolean | string | null;
  drives_from_origin?: boolean | null;
  has_idl?: boolean | null;
  wants_provisional_licence?: boolean | null;
  has_dependants?: boolean | null;
  sector?: string | null;
  employer_name?: string | null;
};

export function dbProfileToArrivalProfile(row: DbArrivalProfile): ArrivalProfile {
  return {
    arrivalType: (row.arrival_type as ArrivalProfile["arrivalType"]) ?? "international_student",
    arrivalStatus: (row.status as ArrivalProfile["arrivalStatus"]) ?? "not_arrived",
    arrivalDate: row.arrival_date ?? "",
    city: row.city ?? "",
    university: row.university ?? "",
    accommodationType: (row.accommodation as ArrivalProfile["accommodationType"]) ?? "not_secured",
    nationality: row.nationality ?? undefined,
    englishLevel: (row.english_level as ArrivalProfile["englishLevel"]) ?? undefined,
    interestedInWork: row.work_interest === true || row.work_interest === "true",
    profileCompleted: true,
    drivesFromOrigin: row.drives_from_origin ?? undefined,
    hasIDL: row.has_idl ?? undefined,
    wantsProvisionalLicence: row.wants_provisional_licence ?? undefined,
    hasDependants: row.has_dependants ?? undefined,
    sector: row.sector ?? undefined,
    employerName: row.employer_name ?? undefined,
  };
}

function routeMatches(task: Task, profile: ArrivalProfile): boolean {
  if (!task.routes || task.routes === "all") return true;
  return (task.routes as string[]).includes(profile.arrivalType);
}

export function conditionMatches(task: Task, profile: ArrivalProfile): boolean {
  const condition = task.conditional?.toLowerCase() ?? "";
  if (!condition) return true;

  const accommodation = profile.accommodationType;

  // Council tax: only private rental or own home
  if (condition.includes("renting privately") || condition.includes("own a home") || condition.includes("private rental or own")) {
    return accommodation === "private_rental" || accommodation === "own_home";
  }

  if (condition.includes("deposit")) {
    return accommodation === "private_rental";
  }

  // Driving licence exchange
  if (condition.includes("drive from") || condition.includes("drives from")) {
    return profile.drivesFromOrigin === true;
  }

  // International driving licence
  if (condition.includes("international driving licence") || condition.includes("idl")) {
    return profile.hasIDL === true;
  }

  // Provisional driving licence (wants to learn to drive in the UK)
  if (condition.includes("provisional")) {
    return profile.wantsProvisionalLicence === true;
  }

  // Dependants / children
  if (condition.includes("dependant") || condition.includes("children")) {
    // If hasDependants is undefined (old data), show the task — let user decide
    return profile.hasDependants !== false;
  }

  // Work interest
  if (condition.includes("work") && !condition.includes("right to work")) {
    return Boolean(profile.interestedInWork);
  }

  return true;
}

export function generateTasksForProfile(profile: ArrivalProfile, seedTasks: Task[] = SEED_TASKS): UserTask[] {
  return seedTasks
    .filter((task) => task.active)
    .filter((task) => routeMatches(task, profile))
    .filter((task) => conditionMatches(task, profile))
    .map((task) => ({ taskId: task.taskId, status: "not_started" as const }));
}

export function mergeGeneratedTasks(existing: UserTask[], generated: UserTask[]): UserTask[] {
  const existingById = new Map(existing.map((task) => [task.taskId, task]));
  return generated.map((task) => existingById.get(task.taskId) ?? task);
}
