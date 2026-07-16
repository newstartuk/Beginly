import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { apiFailure, requireApiActor } from "@/lib/platform/api-auth";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCode = () => Array.from(randomBytes(10), (byte) => alphabet[byte % alphabet.length]).join("").slice(0, 10);

export async function GET(request: NextRequest) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request); requestId = actor.requestId;
    if (actor.demo) return NextResponse.json({ code: "BEGINLY25", shareUrl: `${request.nextUrl.origin}/ref/BEGINLY25`, touched: 3, activated: 1, proofPoints: 125, events: [] }, { headers: { "x-request-id": requestId } });

    const identityResult = await actor.supabase.from("user_referral_identities").select("id,code,state").eq("user_id", actor.userId).maybeSingle();
    let identity = identityResult.data;
    if (identityResult.error) throw identityResult.error;
    for (let attempt = 0; !identity && attempt < 5; attempt += 1) {
      const created = await actor.supabase.from("user_referral_identities").insert({ user_id: actor.userId, code: makeCode(), state: "active" }).select("id,code,state").maybeSingle();
      if (!created.error) identity = created.data;
      else if (created.error.code !== "23505") throw created.error;
    }
    if (!identity) throw new Error("Referral identity could not be created.");

    const [countsResult, pointsResult] = await Promise.all([
      actor.supabase.rpc("beginly_user_referral_counts"),
      actor.supabase.from("proofpoints_ledger").select("event_type,points,source_id,occurred_at,expires_at").eq("user_id", actor.userId).order("occurred_at", { ascending: false }).limit(50),
    ]);
    if (countsResult.error) throw countsResult.error;
    if (pointsResult.error) throw pointsResult.error;
    const now = Date.now();
    const events = (pointsResult.data ?? []).filter((row) => !row.expires_at || new Date(row.expires_at).getTime() > now);
    const proofPoints = events.reduce((total, row) => total + (["redeem", "reverse", "expire"].includes(row.event_type) ? -Math.abs(row.points) : row.points), 0);
    const counts = Array.isArray(countsResult.data) ? countsResult.data[0] as { touched?: number; activated?: number } | undefined : countsResult.data as { touched?: number; activated?: number } | null;
    return NextResponse.json({
      code: identity.code,
      shareUrl: `${request.nextUrl.origin}/ref/${identity.code}`,
      touched: Number(counts?.touched ?? 0),
      activated: Number(counts?.activated ?? 0),
      proofPoints: Math.max(0, proofPoints),
      events: events.slice(0, 12),
    }, { headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
