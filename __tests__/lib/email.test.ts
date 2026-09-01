import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const send = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: (...args: unknown[]) => send(...args) };
  },
}));

const originalEnv = { ...process.env };

describe("lib/email — password reset & changed emails", () => {
  beforeEach(() => {
    send.mockReset().mockResolvedValue({ error: null });
    process.env.RESEND_API_KEY = "test-key";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("sendPasswordResetEmail includes the reset link as both button and plain-text fallback", async () => {
    const { sendPasswordResetEmail } = await import("@/lib/email");

    const { error } = await sendPasswordResetEmail({
      email: "user@example.com",
      name: "Tunde",
      resetUrl: "https://beginly.app/reset-password?code=abc123",
    });

    expect(error).toBeNull();
    expect(send).toHaveBeenCalledTimes(1);
    const call = send.mock.calls[0][0];
    expect(call.to).toBe("user@example.com");
    expect(call.subject).toBe("Reset your Beginly password");
    expect(call.html).toContain("https://beginly.app/reset-password?code=abc123");
    expect(call.html).toContain("Hi Tunde,");
  });

  it("sendPasswordResetEmail falls back to a generic greeting without a name", async () => {
    const { sendPasswordResetEmail } = await import("@/lib/email");

    await sendPasswordResetEmail({ email: "user@example.com", resetUrl: "https://beginly.app/reset-password" });

    const call = send.mock.calls[0][0];
    expect(call.html).toContain("Hi there,");
  });

  it("sendPasswordChangedEmail sends a security notice without exposing a reset link as the primary action", async () => {
    const { sendPasswordChangedEmail } = await import("@/lib/email");

    const { error } = await sendPasswordChangedEmail({ email: "user@example.com", name: "Tunde" });

    expect(error).toBeNull();
    const call = send.mock.calls[0][0];
    expect(call.subject).toBe("Your Beginly password was changed");
    expect(call.html).toContain("Wasn't you?");
    expect(call.html).toContain("/forgot-password");
  });

  it("sendAuthActionEmail uses dedicated copy for known action types and a generic fallback for unknown ones", async () => {
    const { sendAuthActionEmail } = await import("@/lib/email");

    await sendAuthActionEmail({ email: "user@example.com", actionUrl: "https://beginly.app/verify", actionType: "signup" });
    expect(send.mock.calls[0][0].subject).toBe("Confirm your Beginly account");

    send.mockClear();
    await sendAuthActionEmail({ email: "user@example.com", actionUrl: "https://beginly.app/verify", actionType: "some_future_type" });
    expect(send.mock.calls[0][0].subject).toBe("Confirm your Beginly request");
  });

  it("sendTaskReminderEmail defaults to weekly copy and no unsubscribe link", async () => {
    const { sendTaskReminderEmail } = await import("@/lib/email");

    await sendTaskReminderEmail({ email: "user@example.com", name: "Test", taskCount: 2, incompleteTasks: ["Register with a GP", "Open a bank account"] });

    const call = send.mock.calls[0][0];
    expect(call.subject).toBe("Your Beginly weekly check-in - let's keep going 🇬🇧");
    expect(call.html).toContain("Your weekly check-in");
    expect(call.html).toContain("this week");
    expect(call.html).not.toContain("unsubscribe from these emails");
  });

  it("sendTaskReminderEmail adapts subject, heading, and period phrasing to the given frequency", async () => {
    const { sendTaskReminderEmail } = await import("@/lib/email");

    await sendTaskReminderEmail({ email: "user@example.com", name: "Test", taskCount: 1, incompleteTasks: ["Register with a GP"], frequency: "monthly" });

    const call = send.mock.calls[0][0];
    expect(call.subject).toBe("Your Beginly monthly check-in - let's keep going 🇬🇧");
    expect(call.html).toContain("Your monthly check-in");
    expect(call.html).toContain("this month");
    expect(call.html).toContain("enabled monthly email reminders");
  });

  it("sendTaskReminderEmail includes a real unsubscribe link when one is provided", async () => {
    const { sendTaskReminderEmail } = await import("@/lib/email");

    await sendTaskReminderEmail({
      email: "user@example.com",
      name: "Test",
      taskCount: 1,
      incompleteTasks: ["Register with a GP"],
      unsubscribeUrl: "https://beginly.app/api/unsubscribe?u=user-1&t=abc",
    });

    const call = send.mock.calls[0][0];
    expect(call.html).toContain("unsubscribe from these emails");
    expect(call.html).toContain("https://beginly.app/api/unsubscribe?u=user-1&amp;t=abc");
    expect(call.text).toContain("https://beginly.app/api/unsubscribe?u=user-1&t=abc");
  });

  it("returns the error and logs when Resend fails to send", async () => {
    send.mockResolvedValue({ error: { message: "boom" } });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { sendPasswordResetEmail } = await import("@/lib/email");

    const { error } = await sendPasswordResetEmail({ email: "user@example.com", resetUrl: "https://beginly.app/reset-password" });

    expect(error).toEqual({ message: "boom" });
    expect(errorSpy).toHaveBeenCalled();
  });
});
