import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/webhooks/resend/route";

const sendWelcomeEmail = vi.fn();
const insert = vi.fn();
const updateEq2 = vi.fn();
const from = vi.fn();

vi.mock("@/lib/email", () => ({
  sendWelcomeEmail: (...args: unknown[]) => sendWelcomeEmail(...args),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ from: (...args: unknown[]) => from(...args) }),
}));

const originalEnv = { ...process.env };

function webhookRequest(body: unknown, token = "webhook-secret") {
  return new NextRequest("http://localhost/api/webhooks/resend", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
  });
}

const confirmedPayload = {
  type: "UPDATE",
  old_record: { email: "user@example.com", confirmed_at: null },
  record: { email: "user@example.com", confirmed_at: "2026-08-31T00:00:00.000Z", user_metadata: { name: "Tunde" } },
};

describe("POST /api/webhooks/resend", () => {
  beforeEach(() => {
    process.env.BEGINLY_WEBHOOK_SECRET = "webhook-secret";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

    sendWelcomeEmail.mockReset().mockResolvedValue({ error: null });
    insert.mockReset().mockResolvedValue({ error: null });
    updateEq2.mockReset().mockResolvedValue({ error: null });
    from.mockReset().mockReturnValue({
      insert: (...args: unknown[]) => insert(...args),
      update: () => ({ eq: () => ({ eq: (...args: unknown[]) => updateEq2(...args) }) }),
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("returns 503 when BEGINLY_WEBHOOK_SECRET is not set", async () => {
    delete process.env.BEGINLY_WEBHOOK_SECRET;
    const res = await POST(webhookRequest(confirmedPayload));
    expect(res.status).toBe(503);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 401 when the bearer token doesn't match", async () => {
    const res = await POST(webhookRequest(confirmedPayload, "wrong-secret"));
    expect(res.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid JSON", async () => {
    const res = await POST(webhookRequest("not json"));
    expect(res.status).toBe(400);
  });

  it("acknowledges without side effects for a non-confirmation transition", async () => {
    const res = await POST(webhookRequest({
      type: "UPDATE",
      old_record: { email: "user@example.com", confirmed_at: "2026-08-01T00:00:00.000Z" },
      record: { email: "user@example.com", confirmed_at: "2026-08-01T00:00:00.000Z", last_sign_in_at: "now" },
    }));
    const body = await res.json();
    expect(body).toEqual({ acknowledged: true, ignored: "not_confirmation_transition" });
    expect(from).not.toHaveBeenCalled();
    expect(sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it("returns 400 when the confirmed record has no email", async () => {
    const res = await POST(webhookRequest({ type: "INSERT", record: { confirmed_at: "2026-08-31T00:00:00.000Z" } }));
    expect(res.status).toBe(400);
  });

  it("returns 503 when Supabase env vars are missing", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const res = await POST(webhookRequest(confirmedPayload));
    expect(res.status).toBe(503);
    expect(sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it("sends the welcome email, records signature_verified: false, and marks the ledger processed", async () => {
    const res = await POST(webhookRequest(confirmedPayload));
    const body = await res.json();

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ signature_verified: false, state: "received" }));
    expect(sendWelcomeEmail).toHaveBeenCalledWith({ name: "Tunde", email: "user@example.com" });
    expect(updateEq2).toHaveBeenCalledWith("external_event_id", expect.any(String));
    expect(body).toEqual({ success: true });
  });

  it("treats a duplicate ledger insert as a no-op success without sending another email", async () => {
    insert.mockResolvedValue({ error: { code: "23505", message: "duplicate key" } });
    const res = await POST(webhookRequest(confirmedPayload));
    const body = await res.json();
    expect(body).toEqual({ success: true, duplicate: true });
    expect(sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it("returns 503 for a non-duplicate ledger insert failure", async () => {
    insert.mockResolvedValue({ error: { code: "42P01", message: "relation does not exist" } });
    const res = await POST(webhookRequest(confirmedPayload));
    expect(res.status).toBe(503);
    expect(sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it("returns 502 and marks the ledger failed when sendWelcomeEmail errors", async () => {
    sendWelcomeEmail.mockResolvedValue({ error: { message: "resend down" } });
    const res = await POST(webhookRequest(confirmedPayload));
    expect(res.status).toBe(502);
  });

  it("falls back to the email's local part when user_metadata.name is missing", async () => {
    await POST(webhookRequest({
      type: "INSERT",
      record: { email: "newuser@example.com", confirmed_at: "2026-08-31T00:00:00.000Z" },
    }));
    expect(sendWelcomeEmail).toHaveBeenCalledWith({ name: "newuser", email: "newuser@example.com" });
  });
});
