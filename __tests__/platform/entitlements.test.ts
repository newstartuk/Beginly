import { describe, it, expect } from "vitest";
import { resolveEntitlements, hasCapability, recommendSmallestSufficientProduct, productCoverage } from "@/lib/platform/entitlements";
import type { EntitlementGrant, ProductDefinition, UserContext } from "@/lib/platform/types";

function context(overrides: Partial<UserContext> = {}): UserContext {
  return {
    actorId: "user-1",
    displayName: "Test User",
    householdId: "household-1",
    activeMemberId: "user-1",
    route: "student",
    stage: "settling",
    city: "Manchester",
    goals: [],
    profileFacts: [],
    householdMembers: [],
    grants: [],
    ...overrides,
  } as UserContext;
}

function grant(overrides: Partial<EntitlementGrant> = {}): EntitlementGrant {
  return {
    id: "grant-1",
    actorId: "user-1",
    source: "free_core",
    scope: "individual",
    capabilityCode: "basic_nia",
    startsAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const testProducts: ProductDefinition[] = [
  {
    id: "free_os", name: "Free OS", promise: "", kind: "free",
    capabilities: ["basic_nia"], routeFit: "all", scope: "individual",
    autonomyLevel: 1, priceMinor: 0, currency: "GBP", billingInterval: "free", standalone: true,
  },
  {
    id: "cv_studio", name: "CV Studio", promise: "", kind: "standalone",
    capabilities: ["cv_studio"], routeFit: "all", scope: "individual",
    autonomyLevel: 2, priceMinor: 1200, currency: "GBP", billingInterval: "one_off", standalone: true,
  },
  {
    id: "career_pro", name: "Career Pro", promise: "", kind: "subscription",
    capabilities: ["cv_studio", "interview_studio"], routeFit: "all", scope: "individual",
    autonomyLevel: 4, priceMinor: 1900, currency: "GBP", billingInterval: "month", standalone: true,
  },
];

describe("entitlements — resolveEntitlements", () => {
  it("resolves a directly-granted capability code", () => {
    const resolved = resolveEntitlements(context({ grants: [grant()] }), testProducts);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].capabilityCode).toBe("basic_nia");
    expect(resolved[0].allowed).toBe(true);
  });

  it("expands a product-scoped grant into that product's capabilities", () => {
    const resolved = resolveEntitlements(
      context({ grants: [grant({ capabilityCode: undefined, productId: "career_pro" })] }),
      testProducts,
    );
    const codes = resolved.map((r) => r.capabilityCode).sort();
    expect(codes).toEqual(["cv_studio", "interview_studio"]);
  });

  it("excludes a grant that has not started yet", () => {
    const resolved = resolveEntitlements(
      context({ grants: [grant({ startsAt: "2099-01-01T00:00:00.000Z" })] }),
      testProducts,
      new Date("2026-06-01T00:00:00.000Z"),
    );
    expect(resolved).toHaveLength(0);
  });

  it("excludes a grant that has already expired", () => {
    const resolved = resolveEntitlements(
      context({ grants: [grant({ endsAt: "2026-01-15T00:00:00.000Z" })] }),
      testProducts,
      new Date("2026-06-01T00:00:00.000Z"),
    );
    expect(resolved).toHaveLength(0);
  });

  it("includes a grant with no endsAt regardless of how far in the future `at` is", () => {
    const resolved = resolveEntitlements(
      context({ grants: [grant()] }),
      testProducts,
      new Date("2099-01-01T00:00:00.000Z"),
    );
    expect(resolved).toHaveLength(1);
  });

  it("excludes an individual-scope grant belonging to a different actor", () => {
    const resolved = resolveEntitlements(
      context({ actorId: "user-1", grants: [grant({ actorId: "user-2" })] }),
      testProducts,
    );
    expect(resolved).toHaveLength(0);
  });

  it("applies a household-scope grant to any member of the household", () => {
    const resolved = resolveEntitlements(
      context({ actorId: "user-1", householdId: "household-1", grants: [grant({ actorId: "household-1", scope: "household" })] }),
      testProducts,
    );
    expect(resolved).toHaveLength(1);
  });

  it("takes the higher quota limit and combined usage when two grants cover the same capability", () => {
    const resolved = resolveEntitlements(
      context({
        grants: [
          grant({ id: "g1", capabilityCode: "cv_studio", quota: 3, used: 1 }),
          grant({ id: "g2", capabilityCode: "cv_studio", quota: 5, used: 2 }),
        ],
      }),
      testProducts,
    );
    expect(resolved[0].quota.limit).toBe(5);
    expect(resolved[0].quota.used).toBe(2);
    expect(resolved[0].quota.remaining).toBe(3);
  });

  it("treats a null quota (unlimited) as taking priority when merged with a capped grant", () => {
    const resolved = resolveEntitlements(
      context({
        grants: [
          grant({ id: "g1", capabilityCode: "cv_studio", quota: 3, used: 0 }),
          grant({ id: "g2", capabilityCode: "cv_studio" }), // no quota field -> unlimited
        ],
      }),
      testProducts,
    );
    expect(resolved[0].quota.limit).toBe(3);
    expect(resolved[0].quota.remaining).toBe(3);
  });
});

describe("entitlements — hasCapability", () => {
  it("returns true when the capability is allowed with remaining quota", () => {
    const resolved = resolveEntitlements(context({ grants: [grant({ capabilityCode: "cv_studio", quota: 3, used: 1 })] }), testProducts);
    expect(hasCapability(resolved, "cv_studio")).toBe(true);
  });

  it("returns false once quota is fully used", () => {
    const resolved = resolveEntitlements(context({ grants: [grant({ capabilityCode: "cv_studio", quota: 3, used: 3 })] }), testProducts);
    expect(hasCapability(resolved, "cv_studio")).toBe(false);
  });

  it("returns false for a capability that was never granted", () => {
    const resolved = resolveEntitlements(context({ grants: [grant()] }), testProducts);
    expect(hasCapability(resolved, "cv_studio")).toBe(false);
  });

  it("returns true for an unlimited (null quota) capability", () => {
    const resolved = resolveEntitlements(context({ grants: [grant()] }), testProducts);
    expect(hasCapability(resolved, "basic_nia")).toBe(true);
  });
});

describe("entitlements — recommendSmallestSufficientProduct", () => {
  it("recommends no upgrade when the user already owns the capability", () => {
    const rec = recommendSmallestSufficientProduct(
      context({ grants: [grant({ capabilityCode: "cv_studio" })] }),
      ["cv_studio"],
      testProducts,
    );
    expect(rec.type).toBe("use_existing_capability");
    expect(rec.beginlyMayEarn).toBe(false);
  });

  it("flags sponsored access as already covering the need rather than suggesting a purchase", () => {
    const rec = recommendSmallestSufficientProduct(
      context({ grants: [grant({ capabilityCode: "cv_studio", source: "sponsor", productId: "career_pro" })] }),
      ["cv_studio"],
      testProducts,
    );
    expect(rec.type).toBe("activate_sponsored_access");
    expect(rec.beginlyMayEarn).toBe(false);
  });

  it("recommends the cheapest standalone product that covers an uncovered capability", () => {
    const rec = recommendSmallestSufficientProduct(context({ grants: [] }), ["cv_studio"], testProducts);
    // cv_studio (£12 one-off) must win over career_pro (£19/month, which also carries a recurring-billing penalty)
    expect(rec.productId).toBe("cv_studio");
    expect(rec.type).toBe("buy_standalone");
    expect(rec.beginlyMayEarn).toBe(true);
  });

  it("falls back to human review when no product covers the need", () => {
    const rec = recommendSmallestSufficientProduct(context({ grants: [] }), ["nonexistent_capability"], testProducts);
    expect(rec.type).toBe("request_human_review");
    expect(rec.beginlyMayEarn).toBe(false);
  });
});

describe("entitlements — productCoverage", () => {
  it("marks a product as owned only when an active grant targets it", () => {
    const coverage = productCoverage(
      context({ grants: [grant({ capabilityCode: undefined, productId: "cv_studio" })] }),
      testProducts,
    );
    const cvStudio = coverage.find((c) => c.product.id === "cv_studio");
    const careerPro = coverage.find((c) => c.product.id === "career_pro");
    expect(cvStudio?.owned).toBe(true);
    expect(careerPro?.owned).toBe(false);
  });
});
