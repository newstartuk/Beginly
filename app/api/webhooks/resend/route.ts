import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

type AuthRecord = { email?: string; confirmed_at?: string | null; user_metadata?: { name?: string } };
type Payload = { type?: string; record?: AuthRecord; old_record?: AuthRecord };

const secureEqual = (left: string, right: string): boolean => {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
};

export async function POST(request: NextRequest) {
  const secret = process.env.BEGINLY_WEBHOOK_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret) return NextResponse.json({ error: "Webhook delivery is not configured" }, { status: 503 });
  if (!secureEqual(supplied, secret)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await request.text();
  let payload: Payload;
  try { payload = JSON.parse(raw) as Payload; }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const eventId = request.headers.get("x-beginly-event-id") ?? request.headers.get("x-supabase-event-id");
  if (!eventId) return NextResponse.json({ error: "Missing event identifier" }, { status: 400 });

  const { type, record, old_record: oldRecord } = payload;
  const transitionedToConfirmed = type === "UPDATE" && !oldRecord?.confirmed_at && Boolean(record?.confirmed_at);
  const insertedConfirmed = type === "INSERT" && Boolean(record?.confirmed_at);
  if (!transitionedToConfirmed && !insertedConfirmed) return NextResponse.json({ acknowledged: true, ignored: "not_confirmation_transition" });
  if (!record?.email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: "Delivery ledger is not configured" }, { status: 503 });
  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const fingerprint = createHash("sha256").update(raw).digest("hex");
  const { error: ledgerError } = await db.from("webhook_events").insert({ provider: "supabase_auth", external_event_id: eventId, event_type: "user_confirmed", payload_fingerprint: fingerprint, status: "processing" });
  if (ledgerError) {
    if (ledgerError.code === "23505") return NextResponse.json({ success: true, duplicate: true });
    return NextResponse.json({ error: "Unable to record webhook" }, { status: 503 });
  }

  const name = record.user_metadata?.name?.trim() || record.email.split("@")[0];
  const result = await sendWelcomeEmail({ name, email: record.email });
  await db.from("webhook_events").update({ status: result.error ? "failed" : "complete", error_code: result.error ? "email_delivery_failed" : null, processed_at: new Date().toISOString() }).eq("provider", "supabase_auth").eq("external_event_id", eventId);
  if (result.error) return NextResponse.json({ error: "Email delivery failed" }, { status: 502 });
  return NextResponse.json({ success: true });
}
