import { createHash, randomUUID } from "node:crypto";
import { createObservabilitySink } from "@/lib/providers/observability";
import type { ObservabilityEvent } from "@/lib/providers/types";

const sink = createObservabilitySink();
const actorHash = (actorId?: string): string | undefined => actorId ? createHash("sha256").update(actorId).digest("hex").slice(0, 24) : undefined;

export async function recordPlatformEvent(input: Omit<ObservabilityEvent, "id" | "timestamp" | "actorHash"> & { actorId?: string }): Promise<void> {
  const { actorId, ...event } = input;
  try {
    await sink.record({ id: randomUUID(), timestamp: new Date().toISOString(), actorHash: actorHash(actorId), ...event });
  } catch {
    // Observability must never break a user operation.
  }
}

export async function readPlatformEvents(limit = 100): Promise<ObservabilityEvent[]> { return sink.query(limit); }
export async function platformObservabilityHealth() { return sink.health(); }
