import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/send-email-hook/route";

const { verify, FakeWebhookVerificationError } = vi.hoisted(() => ({
  verify: vi.fn(),
  FakeWebhookVerificationError: class extends Error {},
}));
const sendPasswordResetEmail = vi.fn();
const sendAuthActionEmail = vi.fn();

vi.mock("standardwebhooks", () => ({
  Webhook: class {
    verify(...args: unknown[]) {
      return verify(...args);
    }
  },
  WebhookVerificationError: FakeWebhookVerificationError,
}));

vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: (...args: unknown[]) => sendPasswordResetEmail(...args),
  sendAuthActionEmail: (...args: unknown[]) => sendAuthActionEmail(...args),
}));

const originalEnv = { ...process.env };

function postRequest(body: string, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/auth/send-email-hook", {
    method: "POST",
    body,
    headers: { "webhook-id": "id", "webhook-timestamp": "123", "webhook-signature": "v1,sig", ...headers },
  });
}

describe("POST /api/auth/send-email-hook", () => {
  beforeEach(() => {
    verify.mockReset();
    sendPasswordResetEmail.mockReset().mockResolvedValue({ error: null });
    sendAuthActionEmail.mockReset().mockResolvedValue({ error: null });
    process.env.SEND_EMAIL_HOOK_SECRET = "whsec_test";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("returns 503 when the hook secret isn't configured", async () => {
    delete process.env.SEND_EMAIL_HOOK_SECRET;
    const res = await POST(postRequest("{}"));
    expect(res.status).toBe(503);
    expect(verify).not.toHaveBeenCalled();
  });

  it("returns 401 when signature verification fails", async () => {
    verify.mockImplementation(() => {
      throw new FakeWebhookVerificationError("bad signature");
    });
    const res = await POST(postRequest("not json"));
    expect(res.status).toBe(401);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("returns 400 when the verified payload is missing required fields", async () => {
    verify.mockReturnValue({ user: { email: "user@example.com" }, email_data: {} });
    const res = await POST(postRequest("{}"));
    expect(res.status).toBe(400);
  });

  it("sends the password reset email for a recovery action and builds the verify URL", async () => {
    verify.mockReturnValue({
      user: { email: "user@example.com", user_metadata: { name: "Tunde" } },
      email_data: { token_hash: "th_123", redirect_to: "https://beginly.app/reset-password", email_action_type: "recovery" },
    });
    const res = await POST(postRequest("{}"));
    expect(res.status).toBe(200);
    expect(sendPasswordResetEmail).toHaveBeenCalledWith({
      email: "user@example.com",
      name: "Tunde",
      resetUrl: "https://test.supabase.co/auth/v1/verify?token=th_123&type=recovery&redirect_to=https%3A%2F%2Fbeginly.app%2Freset-password",
    });
    expect(sendAuthActionEmail).not.toHaveBeenCalled();
  });

  it("falls back to the generic auth action email for non-recovery action types", async () => {
    verify.mockReturnValue({
      user: { email: "user@example.com" },
      email_data: { token_hash: "th_456", redirect_to: "https://beginly.app/login", email_action_type: "signup" },
    });
    const res = await POST(postRequest("{}"));
    expect(res.status).toBe(200);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(sendAuthActionEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "user@example.com", actionType: "signup" }),
    );
  });

  it("returns 500 when the underlying email send fails", async () => {
    verify.mockReturnValue({
      user: { email: "user@example.com" },
      email_data: { token_hash: "th_789", redirect_to: "https://beginly.app/reset-password", email_action_type: "recovery" },
    });
    sendPasswordResetEmail.mockResolvedValue({ error: { message: "delivery failed" } });
    const res = await POST(postRequest("{}"));
    expect(res.status).toBe(500);
  });
});
