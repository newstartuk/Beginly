import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProduct } from "./catalog";
import { isExplicitDemoMode, PlatformContextUnavailableError } from "./runtime";
import type { EntitlementGrant, MigrationRoute, ProductDefinition, UserContext } from "./types";

export interface ProductEntryState {
  productId: string;
  state: "draft" | "active" | "paused" | "completed";
  routeContext: MigrationRoute;
  goal: string;
  contextNotes?: string;
  personalisationConsent: boolean;
  updatedAt: string;
}

export interface StandaloneProductAccess {
  actorId: string;
  displayName: string;
  product: ProductDefinition;
  owned: boolean;
  sourceLabels: string[];
  entry: ProductEntryState | null;
}

const activeNow = new Date().toISOString();
const asEntry = (row: Record<string, unknown> | null): ProductEntryState | null => row ? {
  productId: String(row.product_id),
  state: (row.state as ProductEntryState["state"]) ?? "active",
  routeContext: row.route_context as MigrationRoute,
  goal: String(row.goal ?? ""),
  contextNotes: row.context_notes ? String(row.context_notes) : undefined,
  personalisationConsent: row.personalisation_consent === true,
  updatedAt: String(row.updated_at ?? new Date().toISOString()),
} : null;

async function queryAccess(userId: string, productId: string, supabase: SupabaseClient): Promise<StandaloneProductAccess> {
  const product = getProduct(productId);
  if (!product || !product.standalone) throw new PlatformContextUnavailableError("This standalone product is not available.");
  const [profileResult, grantsResult, entryResult] = await Promise.all([
    supabase.from("user_profiles").select("display_name").eq("id", userId).maybeSingle(),
    supabase.from("entitlements").select("id,actor_id,member_id,source,scope,product_id,capability_code,starts_at,ends_at,autonomy_level,quota,used,conditions").eq("actor_id", userId).eq("product_id", productId).lte("starts_at", activeNow).or(`ends_at.is.null,ends_at.gt.${activeNow}`),
    supabase.from("product_entry_states").select("product_id,state,route_context,goal,context_notes,personalisation_consent,updated_at").eq("actor_id", userId).eq("product_id", productId).maybeSingle(),
  ]);
  if (grantsResult.error) throw grantsResult.error;
  if (entryResult.error) throw entryResult.error;
  const grants = grantsResult.data ?? [];
  return {
    actorId: userId,
    displayName: String((profileResult.data as Record<string, unknown> | null)?.display_name ?? "Beginly member"),
    product,
    owned: grants.length > 0,
    sourceLabels: [...new Set(grants.map((row: Record<string, unknown>) => String(row.source).replaceAll("_", " ")))],
    entry: asEntry(entryResult.data as Record<string, unknown> | null),
  };
}

export async function loadStandaloneProductAccess(productId: string): Promise<StandaloneProductAccess | null> {
  if (isExplicitDemoMode()) {
    const product = getProduct(productId);
    if (!product) return null;
    return { actorId: "demo-user", displayName: "Demo member", product, owned: true, sourceLabels: ["demo"], entry: { productId, state: "active", routeContext: product.routeFit === "all" ? "graduate" : product.routeFit[0], goal: product.promise, personalisationConsent: true, updatedAt: new Date().toISOString() } };
  }
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return queryAccess(user.id, productId, supabase as unknown as SupabaseClient);
}

function grantFromRow(row: Record<string, unknown>): EntitlementGrant {
  return {
    id: String(row.id), actorId: String(row.actor_id), memberId: row.member_id ? String(row.member_id) : undefined,
    source: row.source as EntitlementGrant["source"], scope: row.scope as EntitlementGrant["scope"],
    productId: row.product_id ? String(row.product_id) : undefined, capabilityCode: row.capability_code ? String(row.capability_code) : undefined,
    startsAt: String(row.starts_at), endsAt: row.ends_at ? String(row.ends_at) : undefined,
    autonomyLevel: row.autonomy_level as EntitlementGrant["autonomyLevel"], quota: row.quota == null ? undefined : Number(row.quota), used: Number(row.used ?? 0),
    conditions: row.conditions && typeof row.conditions === "object" ? row.conditions as Record<string, string | number | boolean> : undefined,
  };
}

export async function loadStandaloneProductContext(userId: string, productId: string, supabase: SupabaseClient): Promise<UserContext> {
  const access = await queryAccess(userId, productId, supabase);
  if (!access.owned) throw new PlatformContextUnavailableError("Activate this product before using its workspace.");
  if (!access.entry || access.entry.state !== "active") throw new PlatformContextUnavailableError("Complete the short product setup before asking Nia to use this workspace.");
  const { data: grants, error } = await supabase.from("entitlements").select("*").eq("actor_id", userId).lte("starts_at", activeNow).or(`ends_at.is.null,ends_at.gt.${activeNow}`);
  if (error) throw error;
  const stage = access.product.capabilities.some((item) => item.includes("career") || item.includes("cv") || item.includes("interview")) ? "career_preparation" : access.product.id.includes("founder") ? "progression" : "transition";
  return {
    actorId: userId,
    displayName: access.displayName,
    householdId: `personal-${userId}`,
    activeMemberId: userId,
    route: access.entry.routeContext,
    stage,
    city: "",
    goals: [{ id: `product-${productId}`, label: access.entry.goal, horizon: "now", status: "active" }],
    profileFacts: [
      { key: "product_first_entry", value: productId, confidence: 1, source: "user", updatedAt: access.entry.updatedAt },
      ...(access.entry.contextNotes ? [{ key: "product_context_notes", value: access.entry.contextNotes, confidence: 1, source: "user" as const, updatedAt: access.entry.updatedAt }] : []),
    ],
    householdMembers: [{ id: userId, displayName: access.displayName, role: "primary", ageBand: "adult", route: access.entry.routeContext, privateWorkspace: true, isActor: true }],
    grants: (grants ?? []).map((row: Record<string, unknown>) => grantFromRow(row)),
    completedTaskIds: [], taskStates: {}, dismissedRecommendationIds: [], proofPoints: 0,
    promotionPreference: "contextual", aiConsent: access.entry.personalisationConsent, locationConsent: false,
  };
}
