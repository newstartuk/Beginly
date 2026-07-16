import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { nowIso, redactObject } from "./core";
import type { ObservabilityEvent, ObservabilitySink, ProviderHealth } from "./types";

export class JsonlObservabilitySink implements ObservabilitySink {
  readonly name = "jsonl-observability";
  constructor(private readonly file = resolve(process.cwd(), ".beginly-local/observability.jsonl")) {}
  async record(event: ObservabilityEvent): Promise<void> {
    await mkdir(dirname(this.file), { recursive: true });
    const safe = redactObject({ ...event, timestamp: event.timestamp || nowIso() });
    await appendFile(this.file, `${JSON.stringify(safe)}\n`, "utf8");
  }
  async query(limit = 100): Promise<ObservabilityEvent[]> {
    try {
      const rows = (await readFile(this.file, "utf8")).trim().split(/\r?\n/).filter(Boolean).slice(-Math.max(1, limit));
      return rows.map((row) => JSON.parse(row) as ObservabilityEvent);
    } catch { return []; }
  }
  async health(): Promise<ProviderHealth> { return { provider: this.name, mode: "local", healthy: true, productionVerified: false, checkedAt: nowIso(), details: { events: (await this.query(10_000)).length } }; }
}

export class RemoteObservabilitySink implements ObservabilitySink {
  readonly name = "remote-observability";
  constructor(private readonly endpoint: string, private readonly fallback = new JsonlObservabilitySink()) {
    if (!/^https:\/\//.test(endpoint)) throw new Error("OBSERVABILITY_DSN must be HTTPS");
  }
  async record(event: ObservabilityEvent): Promise<void> {
    try {
      const response = await fetch(this.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(redactObject(event)), signal: AbortSignal.timeout(5_000) });
      if (!response.ok) throw new Error(`observability status ${response.status}`);
    } catch { await this.fallback.record({ ...event, metadata: { ...event.metadata, fallback: true } }); }
  }
  query(limit?: number): Promise<ObservabilityEvent[]> { return this.fallback.query(limit); }
  async health(): Promise<ProviderHealth> { return { provider: this.name, mode: "production-adapter-with-local-fallback", healthy: true, productionVerified: false, checkedAt: nowIso() }; }
}

export function createObservabilitySink(): ObservabilitySink {
  return process.env.OBSERVABILITY_DSN ? new RemoteObservabilitySink(process.env.OBSERVABILITY_DSN) : new JsonlObservabilitySink();
}
