// Student visa term-time work-hour tracker.
//
// UK Student visa holders on a degree-level course are generally capped at 20 hours
// of work a week during term time, with no limit during official vacation periods.
// This module is the pure logic: weekly bucketing, live status banding as hours are
// entered, and the notification copy for each band. See app/work-hours/page.tsx for
// the UI and lib/platform/dashboard.ts for the Today-page entry point.

export const WEEKLY_HOUR_LIMIT = 20;
export const WARNING_THRESHOLD = 17;

export const STUDENT_VISA_WORK_LINKS = [
  { label: "Student visa — work conditions (gov.uk)", url: "https://www.gov.uk/student-visa/work" },
  { label: "UKCISA — working during your studies", url: "https://www.ukcisa.org.uk/Information--Advice/Working/Student-work" },
];

export type WorkHoursStatus = "vacation" | "safe" | "approaching" | "at_limit" | "breached";

export interface WeekEntry {
  weekStart: string; // ISO date (Monday) identifying the week
  isVacation: boolean;
  days: Record<string, number>; // ISO date -> hours worked that day
}

export interface WorkHoursStore {
  weeks: Record<string, WeekEntry>;
}

export interface WorkHoursMessage {
  status: WorkHoursStatus;
  headline: string;
  detail: string;
}

// Builds the ISO date from local calendar components, not `toISOString()` (which
// converts to UTC and shifts the date backward for any timezone ahead of UTC —
// including the UK during British Summer Time — whenever it's applied to local
// midnight).
function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Monday of the week containing `date`, as an ISO date string. */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday .. 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return toISODate(d);
}

export function addWeeks(weekStart: string, delta: number): string {
  const d = new Date(`${weekStart}T00:00:00`);
  d.setDate(d.getDate() + delta * 7);
  return toISODate(d);
}

/** The 7 ISO dates (Mon–Sun) that make up the week starting at `weekStart`. */
export function getWeekDays(weekStart: string): string[] {
  const start = new Date(`${weekStart}T00:00:00`);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toISODate(d);
  });
}

export function formatWeekRange(weekStart: string): string {
  const days = getWeekDays(weekStart);
  const start = new Date(`${days[0]}T00:00:00`);
  const end = new Date(`${days[6]}T00:00:00`);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: sameMonth ? undefined : "short" }).format(start);
  const endFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(end);
  return `${startFmt} – ${endFmt}`;
}

export function weekTotal(days: Record<string, number>): number {
  return Object.values(days).reduce((sum, hours) => sum + (Number.isFinite(hours) ? hours : 0), 0);
}

export function formatHours(hours: number): string {
  const rounded = Math.round(hours * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(rounded * 10 % 1 === 0 ? 1 : 2);
}

export function getWorkHoursStatus(totalHours: number, isVacation: boolean): WorkHoursStatus {
  if (isVacation) return "vacation";
  if (totalHours > WEEKLY_HOUR_LIMIT) return "breached";
  if (totalHours >= WEEKLY_HOUR_LIMIT) return "at_limit";
  if (totalHours >= WARNING_THRESHOLD) return "approaching";
  return "safe";
}

export function getWorkHoursMessage(totalHours: number, isVacation: boolean): WorkHoursMessage {
  const status = getWorkHoursStatus(totalHours, isVacation);
  const remaining = Math.max(0, WEEKLY_HOUR_LIMIT - totalHours);
  const over = Math.max(0, totalHours - WEEKLY_HOUR_LIMIT);

  switch (status) {
    case "vacation":
      return {
        status,
        headline: "On holiday — no weekly limit applies",
        detail: "You've marked this week as a vacation period, so the 20-hour Student visa work limit doesn't apply. You can work unlimited hours this week.",
      };
    case "breached":
      return {
        status,
        headline: `${formatHours(totalHours)} hours worked — ${formatHours(over)} over your 20-hour limit`,
        detail: "You are working above your 20-hour weekly limit. This breaches your Student visa conditions. See the official gov.uk guidance below for what this means and what to do next.",
      };
    case "at_limit":
      return {
        status,
        headline: "20 of 20 hours — weekly limit reached",
        detail: "You've reached your 20-hour weekly work limit for term time. Any further hours worked this week will breach your Student visa conditions.",
      };
    case "approaching":
      return {
        status,
        headline: `${formatHours(remaining)} hour${remaining === 1 ? "" : "s"} left this week`,
        detail: `You've worked ${formatHours(totalHours)} of your 20-hour weekly limit. You have ${formatHours(remaining)} hour${remaining === 1 ? "" : "s"} left before you reach it.`,
      };
    default:
      return {
        status,
        headline: `${formatHours(totalHours)} of ${WEEKLY_HOUR_LIMIT} hours used`,
        detail: "You're within your 20-hour weekly work limit for term time.",
      };
  }
}

export function emptyWeek(weekStart: string): WeekEntry {
  return { weekStart, isVacation: false, days: {} };
}

export function getWeek(store: WorkHoursStore, weekStart: string): WeekEntry {
  return store.weeks[weekStart] ?? emptyWeek(weekStart);
}

export function updateWeek(store: WorkHoursStore, week: WeekEntry): WorkHoursStore {
  return { ...store, weeks: { ...store.weeks, [week.weekStart]: week } };
}

export function parseWorkHoursStore(raw: string | null): WorkHoursStore {
  if (!raw) return { weeks: {} };
  try {
    const parsed = JSON.parse(raw) as WorkHoursStore;
    if (parsed && typeof parsed === "object" && parsed.weeks && typeof parsed.weeks === "object") {
      return { weeks: parsed.weeks };
    }
  } catch {
    // Ignore invalid storage and fall back to an empty store.
  }
  return { weeks: {} };
}
