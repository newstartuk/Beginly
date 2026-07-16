import type { JourneyTask } from "./types";

const escapeIcs = (value: string) => value.replaceAll("\\", "\\\\").replaceAll(";", "\\;").replaceAll(",", "\\,").replaceAll("\n", "\\n");
const formatUtc = (value: Date) => value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

export interface JourneyTaskCalendarDetails {
  title: string;
  description: string;
  category: string;
  startsAt: string;
  endsAt: string;
  officialDeadline: boolean;
  webCalendarUrl: string;
}

export function journeyTaskCalendarDetails(task: JourneyTask, now = new Date()): JourneyTaskCalendarDetails {
  const planned = task.dueDate ? new Date(task.dueDate) : new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (!task.dueDate) planned.setUTCHours(9, 0, 0, 0);
  const end = new Date(planned.getTime() + Math.max(15, task.estimatedMinutes) * 60_000);
  const planningNote = task.dueDate
    ? "Beginly journey deadline. Confirm the date against the cited official source."
    : "Beginly suggested planning session; this is not an official deadline.";
  const title = `Beginly: ${task.title}`;
  const description = `${task.summary}\n\n${planningNote}`;
  const web = new URL("https://calendar.google.com/calendar/render");
  web.searchParams.set("action", "TEMPLATE");
  web.searchParams.set("text", title);
  web.searchParams.set("details", description);
  web.searchParams.set("dates", `${formatUtc(planned)}/${formatUtc(end)}`);
  return { title, description, category: task.category, startsAt: planned.toISOString(), endsAt: end.toISOString(), officialDeadline: Boolean(task.dueDate), webCalendarUrl: web.toString() };
}

export function journeyTaskCalendar(task: JourneyTask, actorId: string, now = new Date()): string {
  const details = journeyTaskCalendarDetails(task, now);
  const uid = `${task.id}-${actorId}@beginly.app`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Beginly//Adaptive Journey//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcs(uid)}`,
    `DTSTAMP:${formatUtc(now)}`,
    `DTSTART:${formatUtc(new Date(details.startsAt))}`,
    `DTEND:${formatUtc(new Date(details.endsAt))}`,
    `SUMMARY:${escapeIcs(details.title)}`,
    `DESCRIPTION:${escapeIcs(details.description)}`,
    `CATEGORIES:${escapeIcs(details.category)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(task.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
