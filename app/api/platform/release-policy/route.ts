import { NextRequest, NextResponse } from "next/server";
import { apiFailure, ApiAuthError } from "@/lib/platform/api-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const PUBLIC_PLATFORM_ENDPOINT = true;

type ReleasePolicyRow = {
  minimum_version: string;
  recommended_version: string;
  force_update: boolean;
  maintenance_mode: boolean;
  maintenance_message?: string | null;
  download_url?: string | null;
};
const versions = (value: string) => value.split(".").map((part) => Number(part.replace(/\D.*$/, "")) || 0);
export function compareVersions(left: string, right: string): number { const a = versions(left); const b = versions(right); for (let i = 0; i < Math.max(a.length, b.length); i += 1) { const diff = (a[i] ?? 0) - (b[i] ?? 0); if (diff) return diff; } return 0; }

export async function GET(request: NextRequest) {
  let requestId: string | undefined;
  try {
    requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
    const platform = request.nextUrl.searchParams.get("platform");
    const channel = request.nextUrl.searchParams.get("channel") ?? "production";
    const currentVersion = request.nextUrl.searchParams.get("version") ?? "0.0.0";
    if (!platform || !["web", "android", "ios"].includes(platform)) throw new ApiAuthError(400, "invalid_platform", "A valid platform is required.");
    if (process.env.BEGINLY_DEMO_MODE === "true") return NextResponse.json({ platform, channel, minimumVersion: "1.3.0", recommendedVersion: "1.3.0", forceUpdate: false, maintenanceMode: false, currentVersion, updateRequired: compareVersions(currentVersion, "1.3.0") < 0 }, { headers: { "cache-control": "no-store", "x-request-id": requestId } });
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("app_release_policies").select("minimum_version,recommended_version,force_update,maintenance_mode,maintenance_message,download_url").eq("platform", platform).eq("channel", channel).is("retired_at", null).lte("effective_at", new Date().toISOString()).order("effective_at", { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ platform, channel, currentVersion, updateRequired: false, policyAvailable: false }, { headers: { "cache-control": "no-store", "x-request-id": requestId } });
    const policy = data as unknown as ReleasePolicyRow;
    return NextResponse.json({ platform, channel, currentVersion, minimumVersion: policy.minimum_version, recommendedVersion: policy.recommended_version, forceUpdate: policy.force_update, maintenanceMode: policy.maintenance_mode, maintenanceMessage: policy.maintenance_message, downloadUrl: policy.download_url, updateRequired: compareVersions(currentVersion, policy.minimum_version) < 0, updateRecommended: compareVersions(currentVersion, policy.recommended_version) < 0 }, { headers: { "cache-control": "no-store", "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
