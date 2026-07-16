import type { BillingEvent, BillingState, NiaResponse, Opportunity, UserContext } from "../platform/types";
import type { NiaContextEnvelope } from "../platform/nia-policy";

export type ProviderEnvironment = "local" | "test" | "staging" | "production";
export type DeliveryState = "queued" | "sent" | "delivered" | "bounced" | "failed" | "suppressed";

export interface ProviderHealth {
  provider: string;
  mode: string;
  healthy: boolean;
  productionVerified: boolean;
  checkedAt: string;
  details?: Record<string, string | number | boolean>;
}

export interface EmailMessage {
  idempotencyKey: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  templateId?: string;
  metadata?: Record<string, string>;
}

export interface EmailDelivery {
  id: string;
  idempotencyKey: string;
  state: DeliveryState;
  provider: string;
  createdAt: string;
  detail?: string;
}

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<EmailDelivery>;
  preview(message: EmailMessage): Promise<{ html: string; text: string }>;
  health(): Promise<ProviderHealth>;
}

export interface CheckoutRequest {
  idempotencyKey: string;
  actorId: string;
  productId: string;
  amountMinor: number;
  currency: "GBP";
  returnUrl: string;
  workProductIds?: string[];
  billingInterval?: "one_off" | "month" | "year";
  productName?: string;
}

export interface CheckoutSession {
  id: string;
  provider: string;
  status: "created" | "complete" | "expired";
  url: string;
  request: CheckoutRequest;
}

export interface PaymentWebhookResult {
  accepted: boolean;
  duplicate: boolean;
  billingEvent?: BillingEvent;
  state?: BillingState;
  reason?: string;
}

export interface PaymentProvider {
  readonly name: string;
  createCheckout(request: CheckoutRequest): Promise<CheckoutSession>;
  processWebhook(payload: string, signature: string): Promise<PaymentWebhookResult>;
  health(): Promise<ProviderHealth>;
}

export interface AIRequest {
  idempotencyKey: string;
  message: string;
  context: UserContext;
  contextEnvelope?: NiaContextEnvelope;
  policyVersion: string;
  promptVersion?: string;
}

export interface AIResult {
  provider: string;
  response: NiaResponse;
  latencyMs: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedCostMinor: number;
  recorded: boolean;
}

export interface AIProvider {
  readonly name: string;
  respond(request: AIRequest): Promise<AIResult>;
  health(): Promise<ProviderHealth>;
}

export interface OpportunityFetchContext {
  cursor?: string;
  updatedAfter?: string;
  limit?: number;
}

export interface OpportunityFetchResult {
  provider: string;
  opportunities: Opportunity[];
  nextCursor?: string;
  fetchedAt: string;
  staleCount: number;
}

export interface OpportunityConnector {
  readonly name: string;
  fetch(context?: OpportunityFetchContext): Promise<OpportunityFetchResult>;
  health(): Promise<ProviderHealth>;
}

export interface PushMessage {
  idempotencyKey: string;
  deviceToken: string;
  title: string;
  body: string;
  deepLink?: string;
  data?: Record<string, string | number | boolean>;
}

export interface PushDelivery {
  id: string;
  state: DeliveryState;
  provider: string;
  receiptId?: string;
  createdAt: string;
}

export interface PushProvider {
  readonly name: string;
  send(message: PushMessage): Promise<PushDelivery>;
  health(): Promise<ProviderHealth>;
}

export interface JobPayload<T = unknown> {
  id: string;
  queue: string;
  idempotencyKey: string;
  runAt: string;
  payload: T;
  attempts?: number;
}

export interface JobResult {
  id: string;
  state: "queued" | "running" | "complete" | "failed" | "dead_letter";
  attempts: number;
  result?: unknown;
  error?: string;
}

export interface JobQueue {
  enqueue<T>(job: JobPayload<T>): Promise<JobResult>;
  drain(handler: (job: JobPayload) => Promise<unknown>): Promise<JobResult[]>;
  health(): Promise<ProviderHealth>;
}

export interface ObservabilityEvent {
  id: string;
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  category: string;
  message: string;
  requestId?: string;
  actorHash?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export interface ObservabilitySink {
  record(event: ObservabilityEvent): Promise<void>;
  query(limit?: number): Promise<ObservabilityEvent[]>;
  health(): Promise<ProviderHealth>;
}
