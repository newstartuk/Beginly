import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireProductionSecret, verifyPayloadSignature } from "@/lib/providers/core";
import { calculateCommission } from "@/lib/platform/commission-reconciliation";
import { apiFailure, ApiAuthError } from "@/lib/platform/api-auth";
import { recordPlatformEvent } from "@/lib/platform/observability";

interface PartnerEvent { externalEventId: string; subjectHash: string; eventType: "confirmed_conversion" | "reversal"; valueMinor?: number; occurredAt: string; attributionId?: string; metadata?: Record<string, unknown> }

function parseEvent(value: unknown): PartnerEvent {
  if (!value || typeof value !== "object") throw new ApiAuthError(400, "invalid_webhook", "A webhook object is required.");
  const row = value as Record<string, unknown>;
  const eventType = row.eventType;
  if (eventType !== "confirmed_conversion" && eventType !== "reversal") throw new ApiAuthError(400, "invalid_event_type", "Unsupported conversion event.");
  const externalEventId = typeof row.externalEventId === "string" ? row.externalEventId.slice(0, 180) : "";
  const subjectHash = typeof row.subjectHash === "string" ? row.subjectHash.slice(0, 180) : "";
  const occurredAt = typeof row.occurredAt === "string" ? row.occurredAt : "";
  if (!externalEventId || !subjectHash || Number.isNaN(Date.parse(occurredAt))) throw new ApiAuthError(400, "invalid_webhook_fields", "External event, subject and occurrence time are required.");
  return { externalEventId, subjectHash, eventType, valueMinor: Math.max(0, Math.round(Number(row.valueMinor ?? 0))), occurredAt, attributionId: typeof row.attributionId === "string" ? row.attributionId : undefined, metadata: row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata) ? row.metadata as Record<string, unknown> : undefined };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ programmeId: string }> }) {
  let requestId: string | undefined;
  try {
    requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
    const { programmeId } = await params;
    const raw = await request.text();
    const signature = request.headers.get("x-beginly-signature") ?? "";
    const secret = requireProductionSecret("partner-conversion-webhook", process.env.PARTNER_CONVERSION_WEBHOOK_SECRET, 32);
    if (!verifyPayloadSignature(secret, raw, signature)) throw new ApiAuthError(401, "invalid_signature", "Webhook signature verification failed.");
    const event = parseEvent(JSON.parse(raw));
    const supabase = createAdminSupabaseClient();
    const providerCode = `partner:${programmeId}`;
    const { data: prior, error: priorError } = await supabase.from("webhook_events").select("id,state").eq("provider", providerCode).eq("external_event_id", event.externalEventId).maybeSingle();
    if (priorError) throw priorError;
    if (prior) return NextResponse.json({ accepted: true, duplicate: true, state: prior.state }, { headers: { "x-request-id": requestId } });
    const payloadHash = createHash("sha256").update(raw).digest("hex");
    const { data: webhook, error: webhookError } = await supabase.from("webhook_events").insert({ provider: providerCode, external_event_id: event.externalEventId, signature_verified: true, payload_hash: payloadHash, state: "received" }).select("id").single();
    if (webhookError) throw webhookError;
    const { data: programme, error: programmeError } = await supabase.from("partner_programmes").select("id,commission_rule,status").eq("id", programmeId).maybeSingle();
    if (programmeError) throw programmeError;
    if (!programme || !["active", "sandbox"].includes(programme.status)) throw new ApiAuthError(409, "programme_not_active", "The partner programme is not active.");
    let attributionId = event.attributionId;
    if (!attributionId) {
      const { data: touch } = await supabase.from("referral_touches").select("id").eq("programme_id", programmeId).eq("subject_hash", event.subjectHash).gt("expires_at", event.occurredAt).lte("touched_at", event.occurredAt).order("touched_at", { ascending: false }).limit(1).maybeSingle();
      attributionId = touch?.id;
    }
    const idempotencyKey = `${programmeId}:${event.externalEventId}:${event.eventType}`;
    const { data: conversion, error: conversionError } = await supabase.from("conversion_events").insert({ programme_id: programmeId, external_event_id: event.externalEventId, subject_hash: event.subjectHash, event_type: event.eventType, value_minor: event.valueMinor ?? 0, signature_verified: true, occurred_at: event.occurredAt, idempotency_key: idempotencyKey, payload: { ...event.metadata, attributionId } }).select("id").single();
    if (conversionError) throw conversionError;
    const amountMinor = calculateCommission(programme.commission_rule as Record<string, unknown>, event.valueMinor ?? 0);
    const { error: ledgerError } = await supabase.from("commission_ledger").insert({ programme_id: programmeId, conversion_event_id: conversion.id, attribution_id: attributionId, event_type: event.eventType, amount_minor: amountMinor, currency: "GBP", idempotency_key: `${idempotencyKey}:ledger`, occurred_at: event.occurredAt });
    if (ledgerError) throw ledgerError;
    await supabase.from("webhook_events").update({ state: "processed", processed_at: new Date().toISOString() }).eq("id", webhook.id);
    await recordPlatformEvent({ level: "info", category: "partner_webhook", message: "Partner conversion webhook processed", requestId, metadata: { programmeId, eventType: event.eventType, attributed: Boolean(attributionId), amountMinor } });
    return NextResponse.json({ accepted: true, duplicate: false, conversionId: conversion.id, attributed: Boolean(attributionId), amountMinor }, { status: 202, headers: { "x-request-id": requestId } });
  } catch (error) { return apiFailure(error, requestId); }
}
