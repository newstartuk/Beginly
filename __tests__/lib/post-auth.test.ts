import { describe, it, expect } from "vitest";
import { safeInternalRedirect, productEntryRedirect, resolvePostAuthRedirect, withPostAuthIntent } from "@/lib/navigation/post-auth";

describe("safeInternalRedirect", () => {
  it("returns undefined for empty/nullish input", () => {
    expect(safeInternalRedirect(undefined)).toBeUndefined();
    expect(safeInternalRedirect(null)).toBeUndefined();
    expect(safeInternalRedirect("")).toBeUndefined();
  });

  it("accepts a plain internal path", () => {
    expect(safeInternalRedirect("/platform")).toBe("/platform");
  });

  it("preserves query string and hash on an internal path", () => {
    expect(safeInternalRedirect("/platform?tab=tasks#top")).toBe("/platform?tab=tasks#top");
  });

  it("rejects protocol-relative URLs", () => {
    expect(safeInternalRedirect("//evil.com/phish")).toBeUndefined();
  });

  it("rejects absolute URLs pointing off-site", () => {
    expect(safeInternalRedirect("https://evil.com/phish")).toBeUndefined();
  });

  it("rejects paths that don't start with a slash", () => {
    expect(safeInternalRedirect("platform")).toBeUndefined();
  });

  it("rejects paths containing control characters", () => {
    expect(safeInternalRedirect("/platform\n/evil")).toBeUndefined();
  });
});

describe("productEntryRedirect", () => {
  it("builds a product entry path for a valid id", () => {
    expect(productEntryRedirect("visa_tracker")).toBe("/products/visa_tracker");
  });

  it("returns undefined for an invalid product id", () => {
    expect(productEntryRedirect("Not Valid!")).toBeUndefined();
    expect(productEntryRedirect(null)).toBeUndefined();
  });
});

describe("resolvePostAuthRedirect", () => {
  it("prefers an explicit redirect over a product id", () => {
    expect(resolvePostAuthRedirect({ redirect: "/platform", product: "visa_tracker" })).toBe("/platform");
  });

  it("falls back to a product entry redirect", () => {
    expect(resolvePostAuthRedirect({ redirect: null, product: "visa_tracker" })).toBe("/products/visa_tracker");
  });

  it("returns undefined when neither is present or valid", () => {
    expect(resolvePostAuthRedirect({ redirect: "//evil.com", product: null })).toBeUndefined();
  });
});

describe("withPostAuthIntent", () => {
  it("returns the bare pathname when there is no redirect", () => {
    expect(withPostAuthIntent("/login")).toBe("/login");
    expect(withPostAuthIntent("/forgot-password")).toBe("/forgot-password");
  });

  it("appends an encoded redirect query param when present", () => {
    expect(withPostAuthIntent("/login", "/platform?tab=tasks")).toBe("/login?redirect=%2Fplatform%3Ftab%3Dtasks");
  });

  it("drops an unsafe redirect rather than embedding it", () => {
    expect(withPostAuthIntent("/forgot-password", "https://evil.com")).toBe("/forgot-password");
  });

  it("works for the /reset-password success redirect shape used after a password update", () => {
    const path = withPostAuthIntent("/login", "/platform") + "&reset=true";
    expect(path).toBe("/login?redirect=%2Fplatform&reset=true");
  });
});
