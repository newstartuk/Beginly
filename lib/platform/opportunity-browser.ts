import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { CommercialStatus } from "./types";

export interface OpportunityActionTokenPayload {
  version: 1;
  sessionId: string;
  userId: string;
  opportunityId: string;
  destinationUrl: string;
  hostname: string;
  commercialStatus: CommercialStatus;
  expiresAt: number;
}

function base64url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

function signingSecret(): string {
  const secret = process.env.BEGINLY_OUTBOUND_SIGNING_SECRET || process.env.BEGINLY_WEBHOOK_SECRET;
  if (!secret) {
    if (process.env.BEGINLY_DEMO_MODE === "true") return "beginly-explicit-demo-outbound-secret";
    throw new Error("BEGINLY_OUTBOUND_SIGNING_SECRET is required.");
  }
  return secret;
}

export function normaliseDestination(raw: string): URL {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("Only HTTPS opportunity destinations are allowed.");
  if (url.username || url.password) throw new Error("Credential-bearing opportunity URLs are not allowed.");
  url.hash = "";
  return url;
}

export function signOpportunityAction(payload: OpportunityActionTokenPayload): string {
  const encoded = base64url(JSON.stringify(payload));
  const signature = createHmac("sha256", signingSecret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyOpportunityAction(token: string): OpportunityActionTokenPayload {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) throw new Error("Invalid opportunity action token.");
  const expected = createHmac("sha256", signingSecret()).update(encoded).digest();
  const supplied = Buffer.from(signature, "base64url");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new Error("Invalid opportunity action signature.");
  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as OpportunityActionTokenPayload;
  if (payload.version !== 1 || payload.expiresAt <= Date.now()) throw new Error("Opportunity action token expired.");
  const destination = normaliseDestination(payload.destinationUrl);
  if (destination.hostname !== payload.hostname) throw new Error("Opportunity destination mismatch.");
  return payload;
}

export function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function disclosureRequired(status: CommercialStatus): boolean {
  return status === "commission_embedded" || status === "sponsored";
}

export function isHostAllowed(hostname: string, policy: { hostname: string; allow_subdomains?: boolean; allowed_redirect_hosts?: string[] } | null): boolean {
  if (!policy) return false;
  const exact = hostname === policy.hostname;
  const subdomain = policy.allow_subdomains === true && hostname.endsWith(`.${policy.hostname}`);
  return exact || subdomain;
}
