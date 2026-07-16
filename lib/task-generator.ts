import { SEED_TASKS } from "@/lib/seed-data";
import type { ArrivalProfile, Task, UserTask } from "@/types";

type DbArrivalProfile = {
  arrival_type?: string | null;
  status?: string | null;
  arrival_date?: string | null;
  city?: string | null;
  university?: string | null;
  accommodation?: string | null;
  nationality?: string | null;
  english_level?: string | null;
  work_interest?: boolean | string | null;
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
  };
}

function conditionMatches(task: Task, profile: ArrivalProfile): boolean {
  const condition = task.conditional?.toLowerCase() ?? "";
  const accommodation = profile.accommodationType;

  if (!condition) return true;

  if (condition.includes("renting privately")) {
    return accommodation === "private_rental";
  }

  if (condition.includes("deposit")) {
    return accommodation === "private_rental";
  }

  if (condition.includes("work")) {
    return Boolean(profile.interestedInWork);
  }

  return true;
}

export function generateTasksForProfile(profile: ArrivalProfile, seedTasks: Task[] = SEED_TASKS): UserTask[] {
  return seedTasks
    .filter((task) => task.active)
    .filter((task) => conditionMatches(task, profile))
    .map((task) => ({ taskId: task.taskId, status: "not_started" as const }));
}

export function mergeGeneratedTasks(existing: UserTask[], generated: UserTask[]): UserTask[] {
  const existingById = new Map(existing.map((task) => [task.taskId, task]));
  return generated.map((task) => existingById.get(task.taskId) ?? task);
}
