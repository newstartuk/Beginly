import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { loadPlatformContext } from "@/lib/platform/context";
import { buildJourney } from "@/lib/platform/journey";
import { PlatformContextUnavailableError } from "@/lib/platform/runtime";
import { sendTaskReminderEmail, type ReminderFrequency } from "@/lib/email";
import { signUnsubscribeToken } from "@/lib/unsubscribe";
import { secureEqual } from "@/lib/security";

const FREQUENCY_DAYS: Record<ReminderFrequency, number> = { daily: 1, weekly: 7, biweekly: 14, monthly: 28 };
const VALID_FREQUENCIES: ReadonlySet<string> = new Set<ReminderFrequency>(["daily", "weekly", "biweekly", "monthly"]);
const DEFAULT_MAX_PER_RUN = 50;

function resolveMaxPerRun(): number {
  const raw = process.env.TASK_REMINDER_MAX_PER_RUN;
  if (!raw) return DEFAULT_MAX_PER_RUN;
  // Number(), not parseInt(): parseInt("1.5", 10) truncates to 1 and looks valid —
  // Number("1.5") correctly rejects it, since the whole string must be numeric.
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    console.error(`[cron/task-reminders] Invalid TASK_REMINDER_MAX_PER_RUN "${raw}" — must be a positive integer, falling back to default ${DEFAULT_MAX_PER_RUN}.`);
    return DEFAULT_MAX_PER_RUN;
  }
  return parsed;
}

/**
 * reminder_prefs.frequency is a plain `text` column, not a DB-enforced enum, so a
 * cast alone (`as ReminderFrequency`) would silently trust bad data — this validates
 * against the real allowed set and makes an unrecognized value observable in logs
 * instead of quietly falling back to "weekly" with no trace.
 */
function coerceFrequency(raw: string, userId: string): ReminderFrequency {
  if (VALID_FREQUENCIES.has(raw)) return raw as ReminderFrequency;
  console.warn(`[cron/task-reminders] Unrecognized frequency "${raw}" for user ${userId}, defaulting to weekly.`);
  return "weekly";
}

function isDue(frequency: ReminderFrequency, lastSentAt: string | null): boolean {
  if (!lastSentAt) return true;
  const days = FREQUENCY_DAYS[frequency] ?? FREQUENCY_DAYS.weekly;
  const lastSentTime = new Date(lastSentAt).getTime();
  if (isNaN(lastSentTime)) {
    console.warn(`[cron/task-reminders] Invalid last_sent_at value "${lastSentAt}", treating as due.`);
    return true;
  }
  const elapsedMs = Date.now() - lastSentTime;
  return elapsedMs >= days * 24 * 60 * 60 * 1000;
}

type ReminderRow = {
  user_id: string;
  frequency: string;
  last_sent_at: string | null;
  users: { name: string | null; email: string | null } | null;
};

/**
 * Vercel Cron target — see vercel.json. Runs once daily; per-user cadence
 * (daily/weekly/biweekly/monthly, from reminder_prefs.frequency) is enforced here via
 * last_sent_at, not by the cron schedule itself. Gated behind TASK_REMINDER_EMAILS_ENABLED
 * so it can be toggled off without a redeploy (protects Resend/Vercel usage while iterating).
 * See docs/TASK_REMINDER_EMAILS.md.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret) {
    console.error("[cron/task-reminders] CRON_SECRET is not set.");
    return NextResponse.json({ error: "Cron endpoint is not configured" }, { status: 503 });
  }
  if (!secureEqual(supplied, secret)) {
    console.error("[cron/task-reminders] Bearer token did not match CRON_SECRET.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.TASK_REMINDER_EMAILS_ENABLED !== "true") {
    return NextResponse.json({ enabled: false });
  }

  if (!process.env.TASK_REMINDER_UNSUBSCRIBE_SECRET) {
    console.error("[cron/task-reminders] TASK_REMINDER_UNSUBSCRIBE_SECRET is not set — sending without an unsubscribe link.");
  }

  const maxPerRun = resolveMaxPerRun();
  const db = createAdminSupabaseClient();

  const { data, error } = await db
    .from("reminder_prefs")
    .select("user_id,frequency,last_sent_at,users(name,email)")
    .eq("email_reminders", true);
  if (error) {
    console.error("[cron/task-reminders] Failed to load reminder_prefs:", error.message);
    return NextResponse.json({ error: "Failed to load reminder preferences" }, { status: 503 });
  }

  const rows = (data ?? []) as unknown as ReminderRow[];
  // Coerced once per row here (not inline at each use site) so an invalid DB value
  // only logs once, and isDue()/sendTaskReminderEmail() see the same resolved frequency.
  const withFrequency = rows.map((row) => ({ ...row, frequency: coerceFrequency(row.frequency, row.user_id) }));
  const due = withFrequency.filter((row) => isDue(row.frequency, row.last_sent_at));
  const batch = due.slice(0, maxPerRun);

  let sent = 0;
  let failed = 0;
  let skippedNoContext = 0;
  // Sends where last_sent_at failed to update — the email genuinely went out, but
  // since isDue() will still see the old (or null) last_sent_at, this user remains
  // "due" and is at real risk of getting a duplicate reminder on the next cron run.
  // Tracked separately rather than silently folded into `sent` so it's visible to
  // whoever's monitoring this route, not just buried in a console.error line.
  let sentButUnrecorded = 0;

  for (const row of batch) {
    const email = row.users?.email;
    if (!email) {
      failed += 1;
      console.error(`[cron/task-reminders] No email on file for user ${row.user_id}, skipping.`);
      continue;
    }

    try {
      const context = await loadPlatformContext(row.user_id, db);
      const journey = buildJourney(context);
      const completed = new Set(context.completedTaskIds);
      const incompleteTasks = journey.tasks.filter((task) => !completed.has(task.id)).map((task) => task.title);

      const unsubscribeToken = signUnsubscribeToken(row.user_id);
      const unsubscribeUrl = unsubscribeToken
        ? `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://beginly.app"}/api/unsubscribe?u=${encodeURIComponent(row.user_id)}&t=${encodeURIComponent(unsubscribeToken)}`
        : undefined;

      const { error: sendError } = await sendTaskReminderEmail({
        email,
        name: row.users?.name ?? "",
        taskCount: incompleteTasks.length,
        incompleteTasks,
        frequency: row.frequency,
        unsubscribeUrl,
      });
      if (sendError) {
        failed += 1;
        console.error(`[cron/task-reminders] sendTaskReminderEmail failed for user ${row.user_id}:`, sendError.message);
        continue;
      }

      const { error: updateError } = await db
        .from("reminder_prefs")
        .update({ last_sent_at: new Date().toISOString() })
        .eq("user_id", row.user_id);
      if (updateError) {
        sentButUnrecorded += 1;
        console.error(`[cron/task-reminders] Sent to user ${row.user_id} but failed to update last_sent_at — they may be re-emailed next run:`, updateError.message);
      }

      sent += 1;
    } catch (err) {
      if (err instanceof PlatformContextUnavailableError) {
        // Onboarding incomplete — nothing to remind them about yet.
        skippedNoContext += 1;
        continue;
      }
      failed += 1;
      console.error(`[cron/task-reminders] Unexpected error for user ${row.user_id}:`, err instanceof Error ? err.message : String(err));
    }
  }

  return NextResponse.json({
    enabled: true,
    eligible: rows.length,
    due: due.length,
    processed: batch.length,
    sent,
    sentButUnrecorded,
    failed,
    skippedNoContext,
    cappedAt: due.length > batch.length ? maxPerRun : null,
  });
}
