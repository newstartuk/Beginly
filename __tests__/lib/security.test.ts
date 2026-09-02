import { describe, it, expect } from "vitest";
import { secureEqual } from "@/lib/security";

describe("lib/security — secureEqual", () => {
  it("returns true for identical strings", () => {
    expect(secureEqual("same-secret", "same-secret")).toBe(true);
  });

  it("returns false for different strings of the same length", () => {
    expect(secureEqual("secret-aaaa", "secret-bbbb")).toBe(false);
  });

  it("returns false for different-length strings without throwing", () => {
    expect(secureEqual("short", "a-much-longer-string")).toBe(false);
  });

  it("returns false comparing against an empty string", () => {
    expect(secureEqual("", "non-empty")).toBe(false);
  });

  it("returns true for two empty strings", () => {
    expect(secureEqual("", "")).toBe(true);
  });

  it("handles non-ASCII input without throwing", () => {
    expect(secureEqual("sécrét-🔒", "sécrét-🔒")).toBe(true);
    expect(secureEqual("sécrét-🔒", "sécrét-🔓")).toBe(false);
  });
});
