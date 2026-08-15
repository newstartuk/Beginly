import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { POST } from "@/app/api/auth/password-changed/route";

const requireApiActor = vi.fn();
const apiFailure = vi.fn();
const sendPasswordChangedEmail = vi.fn();

vi.mock("@/lib/platform/api-auth", () => ({
  requireApiActor: (...args: unknown[]) => requireApiActor(...args),
  apiFailure: (...args: unknown[]) => apiFailure(...args),
}));

vi.mock("@/lib/email", () => ({
  sendPasswordChangedEmail: (...args: unknown[]) => sendPasswordChangedEmail(...args),
}));

function postRequest(token = "token-123") {
  return new NextRequest("http://localhost/api/auth/password-changed", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

describe("POST /api/auth/password-changed", () => {
  beforeEach(() => {
    requireApiActor.mockReset();
    apiFailure.mockReset().mockImplementation(() => NextResponse.json({ error: "failed" }, { status: 401 }));
    sendPasswordChangedEmail.mockReset().mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends the confirmation email for a verified, non-demo actor", async () => {
    const getUser = vi.fn().mockResolvedValue({ data: { user: { user_metadata: { name: "Tunde" } } } });
    requireApiActor.mockResolvedValue({
      userId: "user-1",
      email: "user@example.com",
      requestId: "req-1",
      demo: false,
      supabase: { auth: { getUser } },
    });

    const res = await POST(postRequest());
    expect(res.status).toBe(200);
    expect(sendPasswordChangedEmail).toHaveBeenCalledWith({ email: "user@example.com", name: "Tunde" });
    const body = await res.json();
    expect(body).toEqual({ success: true });
  });

  it("acknowledges without sending for a demo actor", async () => {
    requireApiActor.mockResolvedValue({
      userId: "demo-user",
      email: "demo@beginly.test",
      requestId: "req-2",
      demo: true,
      supabase: { auth: { getUser: vi.fn() } },
    });

    const res = await POST(postRequest());
    expect(res.status).toBe(200);
    expect(sendPasswordChangedEmail).not.toHaveBeenCalled();
  });

  it("delegates to apiFailure when the actor can't be authenticated", async () => {
    requireApiActor.mockRejectedValue(new Error("unauthenticated"));

    const res = await POST(postRequest());
    expect(apiFailure).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(401);
    expect(sendPasswordChangedEmail).not.toHaveBeenCalled();
  });

  it("returns 502 when the email fails to send", async () => {
    const getUser = vi.fn().mockResolvedValue({ data: { user: { user_metadata: {} } } });
    requireApiActor.mockResolvedValue({
      userId: "user-1",
      email: "user@example.com",
      requestId: "req-3",
      demo: false,
      supabase: { auth: { getUser } },
    });
    sendPasswordChangedEmail.mockResolvedValue({ error: { message: "delivery failed" } });

    const res = await POST(postRequest());
    expect(res.status).toBe(502);
  });
});
