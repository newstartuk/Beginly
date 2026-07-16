import { PRODUCTS } from "./catalog";
import type { EntitlementGrant, ProductDefinition, ResolvedCapability, UserContext, ValueRecommendation } from "./types";

const isActive = (grant: EntitlementGrant, at: Date): boolean => {
  const start = new Date(grant.startsAt);
  const end = grant.endsAt ? new Date(grant.endsAt) : undefined;
  return start <= at && (!end || end > at);
};

const appliesToMember = (grant: EntitlementGrant, context: UserContext): boolean => {
  if (grant.scope === "household") return grant.actorId === context.householdId || grant.actorId === context.actorId;
  if (grant.scope === "individual" || grant.scope === "selected_member") {
    return grant.actorId === context.actorId && (!grant.memberId || grant.memberId === context.activeMemberId);
  }
  return grant.actorId === context.actorId;
};

export function resolveEntitlements(
  context: UserContext,
  products: ProductDefinition[] = PRODUCTS,
  at = new Date(),
): ResolvedCapability[] {
  const capabilities = new Map<string, ResolvedCapability>();
  const productMap = new Map(products.map((product) => [product.id, product]));

  for (const grant of context.grants) {
    if (!isActive(grant, at) || !appliesToMember(grant, context)) continue;
    const productCapabilities = grant.productId ? productMap.get(grant.productId)?.capabilities ?? [] : [];
    const codes = grant.capabilityCode ? [grant.capabilityCode] : productCapabilities;

    for (const capabilityCode of codes) {
      const existing = capabilities.get(capabilityCode);
      const autonomy = Math.max(existing?.autonomyLevel ?? 0, grant.autonomyLevel ?? productMap.get(grant.productId ?? "")?.autonomyLevel ?? 0);
      const quota = grant.quota ?? null;
      const used = grant.used ?? 0;
      const source = {
        id: grant.id,
        source: grant.source,
        productId: grant.productId,
        startsAt: grant.startsAt,
        endsAt: grant.endsAt,
      };
      if (!existing) {
        capabilities.set(capabilityCode, {
          capabilityCode,
          allowed: true,
          scope: grant.scope,
          autonomyLevel: autonomy,
          quota: { limit: quota, used, remaining: quota === null ? null : Math.max(0, quota - used) },
          sources: [source],
        });
      } else {
        const limits = [existing.quota.limit, quota].filter((value): value is number => value !== null);
        const combinedLimit = limits.length ? Math.max(...limits) : null;
        capabilities.set(capabilityCode, {
          ...existing,
          scope: existing.scope === "household" || grant.scope === "household" ? "household" : existing.scope,
          autonomyLevel: autonomy,
          quota: {
            limit: combinedLimit,
            used: Math.max(existing.quota.used, used),
            remaining: combinedLimit === null ? null : Math.max(0, combinedLimit - Math.max(existing.quota.used, used)),
          },
          sources: [...existing.sources, source],
        });
      }
    }
  }

  return [...capabilities.values()].sort((a, b) => a.capabilityCode.localeCompare(b.capabilityCode));
}

export const hasCapability = (resolved: ResolvedCapability[], capabilityCode: string): boolean =>
  resolved.some((capability) => capability.capabilityCode === capabilityCode && capability.allowed && (capability.quota.remaining === null || capability.quota.remaining > 0));

const productFitsRoute = (product: ProductDefinition, route: UserContext["route"]): boolean =>
  product.routeFit === "all" || product.routeFit.includes(route);

export function recommendSmallestSufficientProduct(
  context: UserContext,
  needCapabilities: string[],
  products: ProductDefinition[] = PRODUCTS,
): ValueRecommendation {
  const resolved = resolveEntitlements(context, products);
  const uncovered = needCapabilities.filter((code) => !hasCapability(resolved, code));

  if (uncovered.length === 0) {
    const sources = needCapabilities.flatMap((code) => resolved.find((item) => item.capabilityCode === code)?.sources ?? []);
    const sponsored = sources.find((source) => source.source === "sponsor" || source.source === "partner_funded");
    return {
      id: `value-existing-${needCapabilities.join("-")}`,
      type: sponsored ? "activate_sponsored_access" : "use_existing_capability",
      reasonCodes: sponsored ? ["capability_already_sponsored", "no_duplicate_purchase"] : ["capability_already_owned", "no_upgrade_needed"],
      explanation: sponsored
        ? "You already have sponsored access to the capability needed for this. Beginly will use that access before suggesting a purchase."
        : "Your current Beginly access already covers this need. You do not need to upgrade.",
      ownedAlternative: sponsored ? undefined : needCapabilities.join(", "),
      sponsoredAlternative: sponsored?.productId,
      confidence: 0.98,
      beginlyMayEarn: false,
      dismissible: true,
    };
  }

  const candidates = products
    .filter((product) => product.id !== "free_os" && productFitsRoute(product, context.route))
    .filter((product) => uncovered.every((capability) => product.capabilities.includes(capability)))
    .sort((a, b) => {
      const recurringPenaltyA = a.billingInterval === "month" || a.billingInterval === "year" ? 500 : 0;
      const recurringPenaltyB = b.billingInterval === "month" || b.billingInterval === "year" ? 500 : 0;
      const extrasA = a.capabilities.length - uncovered.length;
      const extrasB = b.capabilities.length - uncovered.length;
      return (a.priceMinor + recurringPenaltyA + extrasA * 100) - (b.priceMinor + recurringPenaltyB + extrasB * 100);
    });

  const chosen = candidates[0];
  if (!chosen) {
    return {
      id: `value-human-${needCapabilities.join("-")}`,
      type: "request_human_review",
      reasonCodes: ["no_suitable_product_configuration", "human_review_needed"],
      explanation: "Beginly could not identify a suitable product configuration for this need. A human review is the safest next step.",
      confidence: 0.7,
      beginlyMayEarn: false,
      dismissible: true,
    };
  }

  const broader = products
    .filter((product) => product.id !== chosen.id && productFitsRoute(product, context.route))
    .filter((product) => uncovered.every((capability) => product.capabilities.includes(capability)))
    .sort((a, b) => a.priceMinor - b.priceMinor)[0];

  return {
    id: `value-${chosen.id}-${needCapabilities.join("-")}`,
    type: chosen.kind === "standalone" ? "buy_standalone" : "start_subscription",
    productId: chosen.id,
    reasonCodes: ["capability_gap", chosen.kind === "standalone" ? "standalone_sufficient" : "continuing_need"],
    explanation: `${chosen.name} is the smallest current product that covers ${uncovered.length === 1 ? "the capability" : "the capabilities"} you need.`,
    freeAlternative: "Continue with relevant Free OS guidance where available.",
    standaloneAlternative: chosen.kind === "standalone" ? chosen.id : undefined,
    bundleAlternative: broader?.kind === "bundle" ? broader.id : undefined,
    confidence: 0.9,
    beginlyMayEarn: true,
    dismissible: true,
  };
}

export function productCoverage(context: UserContext, products: ProductDefinition[] = PRODUCTS): Array<{
  product: ProductDefinition;
  owned: boolean;
  sourceLabels: string[];
}> {
  const active = context.grants.filter((grant) => isActive(grant, new Date()) && appliesToMember(grant, context));
  return products.map((product) => {
    const matching = active.filter((grant) => grant.productId === product.id);
    return {
      product,
      owned: matching.length > 0,
      sourceLabels: matching.map((grant) => grant.source.replaceAll("_", " ")),
    };
  });
}
