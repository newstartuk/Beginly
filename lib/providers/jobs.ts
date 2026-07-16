import { nowIso } from "./core";
import type { JobPayload, JobQueue, JobResult, ProviderHealth } from "./types";

export class InMemoryJobQueue implements JobQueue {
  readonly name = "in-memory-jobs";
  private readonly jobs: JobPayload[] = [];
  private readonly completed = new Map<string, JobResult>();
  async enqueue<T>(job: JobPayload<T>): Promise<JobResult> {
    const existing = this.completed.get(job.idempotencyKey);
    if (existing) return existing;
    if (!this.jobs.some((queued) => queued.idempotencyKey === job.idempotencyKey)) this.jobs.push(job as JobPayload);
    return { id: job.id, state: "queued", attempts: job.attempts ?? 0 };
  }
  async drain(handler: (job: JobPayload) => Promise<unknown>): Promise<JobResult[]> {
    const due = this.jobs.splice(0).filter((job) => new Date(job.runAt).getTime() <= Date.now());
    const results: JobResult[] = [];
    for (const job of due) {
      const attempts = (job.attempts ?? 0) + 1;
      try {
        const result = await handler(job);
        const complete: JobResult = { id: job.id, state: "complete", attempts, result };
        this.completed.set(job.idempotencyKey, complete); results.push(complete);
      } catch (error) {
        const failed: JobResult = { id: job.id, state: attempts >= 3 ? "dead_letter" : "failed", attempts, error: error instanceof Error ? error.message : String(error) };
        if (attempts < 3) this.jobs.push({ ...job, attempts, runAt: new Date(Date.now() + attempts * 1000).toISOString() });
        this.completed.set(job.idempotencyKey, failed); results.push(failed);
      }
    }
    return results;
  }
  async health(): Promise<ProviderHealth> { return { provider: this.name, mode: "local", healthy: true, productionVerified: false, checkedAt: nowIso(), details: { queued: this.jobs.length, completed: this.completed.size } }; }
}
