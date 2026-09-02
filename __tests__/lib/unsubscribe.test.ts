import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { signUnsubscribeToken, verifyUnsubscribeToken } from "@/lib/unsubscribe";

const originalEnv = { ...process.env };

describe("lib/unsubscribe", () => {
  beforeEach(() => {
    process.env.TASK_REMINDER_UNSUBSCRIBE_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns undefined when the secret isn't configured", () => {
    delete process.env.TASK_REMINDER_UNSUBSCRIBE_SECRET;
    expect(signUnsubscribeToken("user-1")).toBeUndefined();
  });

  it("produces a token that verifies for the same user id", () => {
    const token = signUnsubscribeToken("user-1");
    expect(token).toBeTruthy();
    expect(verifyUnsubscribeToken("user-1", token)).toBe(true);
  });

  it("rejects a token signed for a different user id", () => {
    const token = signUnsubscribeToken("user-1");
    expect(verifyUnsubscribeToken("user-2", token)).toBe(false);
  });

  it("rejects a tampered token", () => {
    const token = signUnsubscribeToken("user-1");
    expect(verifyUnsubscribeToken("user-1", `${token}x`)).toBe(false);
  });

  it("rejects when the secret isn't configured at verify time", () => {
    const token = signUnsubscribeToken("user-1");
    delete process.env.TASK_REMINDER_UNSUBSCRIBE_SECRET;
    expect(verifyUnsubscribeToken("user-1", token)).toBe(false);
  });

  it("rejects missing userId or token", () => {
    expect(verifyUnsubscribeToken(undefined, "abc")).toBe(false);
    expect(verifyUnsubscribeToken("user-1", undefined)).toBe(false);
  });
});
