import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/cron/task-reminders/route";

const loadPlatformContext = vi.fn();
const buildJourney = vi.fn();
const sendTaskReminderEmail = vi.fn();
const selectEq = vi.fn();
const updateEq = vi.fn();
const from = vi.fn();

const { FakePlatformContextUnavailableError } = vi.hoisted(() => ({
  FakePlatformContextUnavailableError: class extends Error {},
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: () => ({ from: (...args: unknown[]) => from(...args) }),
}));

vi.mock("@/lib/platform/context", () => ({
  loadPlatformContext: (...args: unknown[]) => loadPlatformContext(...args),
}));

vi.mock("@/lib/platform/journey", () => ({
  buildJourney: (...args: unknown[]) => buildJourney(...args),
}));

vi.mock("@/lib/platform/runtime", () => ({
  PlatformContextUnavailableError: FakePlatformContextUnavailableError,
}));

vi.mock("@/lib/email", () => ({
  sendTaskReminderEmail: (...args: unknown[]) => sendTaskReminderEmail(...args),
}));

const signUnsubscribeToken = vi.fn();
vi.mock("@/lib/unsubscribe", () => ({
  signUnsubscribeToken: (...args: unknown[]) => signUnsubscribeToken(...args),
}));

const originalEnv = { ...process.env };

function cronRequest(token = "cron-secret") {
  return new NextRequest("http://localhost/api/cron/task-reminders", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

function reminderRow(overrides: Partial<{ user_id: string; frequency: string; last_sent_at: string | null; email: string | null; name: string | null }> = {}) {
  return {
    user_id: overrides.user_id ?? "user-1",
    frequency: overrides.frequency ?? "weekly",
    last_sent_at: overrides.last_sent_at ?? null,
    users: { name: overrides.name ?? "Tunde", email: overrides.email ?? "user@example.com" },
  };
}

describe("GET /api/cron/task-reminders", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = "cron-secret";
    process.env.TASK_REMINDER_EMAILS_ENABLED = "true";
    process.env.TASK_REMINDER_UNSUBSCRIBE_SECRET = "unsub-secret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://beginly.app";
    delete process.env.TASK_REMINDER_MAX_PER_RUN;

    loadPlatformContext.mockReset().mockResolvedValue({ completedTaskIds: ["a"] });
    buildJourney.mockReset().mockReturnValue({ tasks: [{ id: "a", title: "Done task" }, { id: "b", title: "Open task" }] });
    sendTaskReminderEmail.mockReset().mockResolvedValue({ error: null });
    signUnsubscribeToken.mockReset().mockReturnValue("signed-token");
    selectEq.mockReset().mockResolvedValue({ data: [reminderRow()], error: null });
    updateEq.mockReset().mockResolvedValue({ error: null });
    from.mockReset().mockReturnValue({
      select: () => ({ eq: (...args: unknown[]) => selectEq(...args) }),
      update: () => ({ eq: (...args: unknown[]) => updateEq(...args) }),
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("returns 503 when CRON_SECRET is not set", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(cronRequest());
    expect(res.status).toBe(503);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 401 when the bearer token doesn't match", async () => {
    const res = await GET(cronRequest("wrong-secret"));
    expect(res.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it("no-ops without querying anything when the kill switch is off", async () => {
    process.env.TASK_REMINDER_EMAILS_ENABLED = "false";
    const res = await GET(cronRequest());
    const body = await res.json();
    expect(body).toEqual({ enabled: false });
    expect(from).not.toHaveBeenCalled();
    expect(sendTaskReminderEmail).not.toHaveBeenCalled();
  });

  it("sends to a user who has never been reminded and records last_sent_at", async () => {
    const res = await GET(cronRequest());
    const body = await res.json();

    expect(sendTaskReminderEmail).toHaveBeenCalledWith({
      email: "user@example.com",
      name: "Tunde",
      taskCount: 1,
      incompleteTasks: ["Open task"],
      frequency: "weekly",
      unsubscribeUrl: "https://beginly.app/api/unsubscribe?u=user-1&t=signed-token",
    });
    expect(updateEq).toHaveBeenCalledWith("user_id", "user-1");
    expect(body).toMatchObject({ enabled: true, eligible: 1, due: 1, sent: 1, failed: 0 });
  });

  it("omits the unsubscribe link when TASK_REMINDER_UNSUBSCRIBE_SECRET isn't configured", async () => {
    signUnsubscribeToken.mockReturnValue(undefined);
    await GET(cronRequest());
    expect(sendTaskReminderEmail).toHaveBeenCalledWith(expect.objectContaining({ unsubscribeUrl: undefined }));
  });

  it("skips a weekly user who was reminded 2 days ago", async () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    selectEq.mockResolvedValue({ data: [reminderRow({ frequency: "weekly", last_sent_at: twoDaysAgo })], error: null });

    const res = await GET(cronRequest());
    const body = await res.json();

    expect(sendTaskReminderEmail).not.toHaveBeenCalled();
    expect(body).toMatchObject({ due: 0, sent: 0 });
  });

  it("sends to a weekly user who was reminded 8 days ago", async () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    selectEq.mockResolvedValue({ data: [reminderRow({ frequency: "weekly", last_sent_at: eightDaysAgo })], error: null });

    const res = await GET(cronRequest());
    const body = await res.json();

    expect(sendTaskReminderEmail).toHaveBeenCalledTimes(1);
    expect(body).toMatchObject({ due: 1, sent: 1 });
  });

  it("does not treat a user mid-way through a monthly cadence as due", async () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    selectEq.mockResolvedValue({ data: [reminderRow({ frequency: "monthly", last_sent_at: tenDaysAgo })], error: null });

    const res = await GET(cronRequest());
    const body = await res.json();

    expect(sendTaskReminderEmail).not.toHaveBeenCalled();
    expect(body).toMatchObject({ due: 0 });
  });

  it("counts a user with incomplete onboarding as skipped, not failed, and doesn't email them", async () => {
    loadPlatformContext.mockRejectedValue(new FakePlatformContextUnavailableError("no profile"));

    const res = await GET(cronRequest());
    const body = await res.json();

    expect(sendTaskReminderEmail).not.toHaveBeenCalled();
    expect(body).toMatchObject({ skippedNoContext: 1, failed: 0, sent: 0 });
  });

  it("counts a failed send without updating last_sent_at, so it's retried next run", async () => {
    sendTaskReminderEmail.mockResolvedValue({ error: { message: "delivery failed" } });

    const res = await GET(cronRequest());
    const body = await res.json();

    expect(updateEq).not.toHaveBeenCalled();
    expect(body).toMatchObject({ sent: 0, failed: 1 });
  });

  it("coerces an unrecognized DB frequency value to weekly instead of trusting a cast", async () => {
    selectEq.mockResolvedValue({ data: [reminderRow({ frequency: "yearly" })], error: null });

    const res = await GET(cronRequest());
    const body = await res.json();

    expect(sendTaskReminderEmail).toHaveBeenCalledWith(expect.objectContaining({ frequency: "weekly" }));
    expect(body).toMatchObject({ due: 1, sent: 1 });
  });

  it("counts a successful send whose last_sent_at update failed as sentButUnrecorded, not a clean success", async () => {
    updateEq.mockResolvedValue({ error: { message: "db write failed" } });

    const res = await GET(cronRequest());
    const body = await res.json();

    expect(sendTaskReminderEmail).toHaveBeenCalledTimes(1);
    expect(body).toMatchObject({ sent: 1, sentButUnrecorded: 1, failed: 0 });
  });

  it("respects TASK_REMINDER_MAX_PER_RUN and reports the cap", async () => {
    process.env.TASK_REMINDER_MAX_PER_RUN = "1";
    selectEq.mockResolvedValue({
      data: [reminderRow({ user_id: "user-1" }), reminderRow({ user_id: "user-2" })],
      error: null,
    });

    const res = await GET(cronRequest());
    const body = await res.json();

    expect(sendTaskReminderEmail).toHaveBeenCalledTimes(1);
    expect(body).toMatchObject({ due: 2, processed: 1, sent: 1, cappedAt: 1 });
  });

  it.each(["0", "-1", "not-a-number", "1.5"])(
    "treats an invalid TASK_REMINDER_MAX_PER_RUN (%s) as the default cap instead of misbehaving",
    async (invalidValue) => {
      process.env.TASK_REMINDER_MAX_PER_RUN = invalidValue;
      selectEq.mockResolvedValue({
        data: [reminderRow({ user_id: "user-1" }), reminderRow({ user_id: "user-2" })],
        error: null,
      });

      const res = await GET(cronRequest());
      const body = await res.json();

      // With only 2 due users and a default cap of 50, nothing should be capped —
      // in particular, "-1" must not slip through to due.slice(0, -1), which would
      // silently drop the last user while still reporting a cap.
      expect(sendTaskReminderEmail).toHaveBeenCalledTimes(2);
      expect(body).toMatchObject({ due: 2, processed: 2, sent: 2, cappedAt: null });
    },
  );

  it("returns 503 when the reminder_prefs query itself fails", async () => {
    selectEq.mockResolvedValue({ data: null, error: { message: "connection refused" } });

    const res = await GET(cronRequest());
    expect(res.status).toBe(503);
    expect(sendTaskReminderEmail).not.toHaveBeenCalled();
  });
});
