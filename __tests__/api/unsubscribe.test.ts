import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/unsubscribe/route";

const verifyUnsubscribeToken = vi.fn();
const updateEq = vi.fn();
const from = vi.fn();

vi.mock("@/lib/unsubscribe", () => ({
  verifyUnsubscribeToken: (...args: unknown[]) => verifyUnsubscribeToken(...args),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: () => ({ from: (...args: unknown[]) => from(...args) }),
}));

const originalEnv = { ...process.env };

function unsubscribeRequest(query: string) {
  return new NextRequest(`http://localhost/api/unsubscribe${query}`);
}

describe("GET /api/unsubscribe", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://beginly.app";
    verifyUnsubscribeToken.mockReset().mockReturnValue(true);
    updateEq.mockReset().mockResolvedValue({ error: null });
    from.mockReset().mockReturnValue({ update: () => ({ eq: (...args: unknown[]) => updateEq(...args) }) });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("redirects to an error page when the token is invalid", async () => {
    verifyUnsubscribeToken.mockReturnValue(false);
    const res = await GET(unsubscribeRequest("?u=user-1&t=bad"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://beginly.app/unsubscribed?error=invalid_link");
    expect(from).not.toHaveBeenCalled();
  });

  it("turns off email reminders and redirects to the confirmation page on success", async () => {
    const res = await GET(unsubscribeRequest("?u=user-1&t=good"));
    expect(updateEq).toHaveBeenCalledWith("user_id", "user-1");
    expect(from).toHaveBeenCalledWith("reminder_prefs");
    expect(res.headers.get("location")).toBe("https://beginly.app/unsubscribed");
  });

  it("redirects to an error page when the database update fails", async () => {
    updateEq.mockResolvedValue({ error: { message: "db down" } });
    const res = await GET(unsubscribeRequest("?u=user-1&t=good"));
    expect(res.headers.get("location")).toBe("https://beginly.app/unsubscribed?error=update_failed");
  });
});
