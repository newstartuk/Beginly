/**
 * Beginly Feature Flags — Phase 0
 *
 * Controls which MVP layers are enabled.
 * Set to false to disable a feature without removing its code.
 *
 * Defaults are conservative (all enabled for local dev).
 * In production, override via environment variables.
 *
 * Usage:
 *   import { flags } from "@/lib/feature-flags"
 *   if (flags.ENABLE_JOURNEY) { ... }
 *
 * Runtime toggle (e.g. for deploy-gating):
 *   process.env.FF_NIA_V2="false" disables Nia 2.0
 */

export const flags = {
  /**
   * Nia 2.0 — Conversational guide with scoped memory,
   * proactive nudges, and editable facts panel.
   */
  ENABLE_NIA_V2: (process.env.FF_NIA_V2 ?? "true").toLowerCase() !== "false",

  /**
   * Journey layer — 90-day timeline, settlement score,
   * milestone banner, badge cards, calendar export.
   */
  ENABLE_JOURNEY: (process.env.FF_JOURNEY ?? "true").toLowerCase() !== "false",

  /**
   * Intelligence MVP — Scam Radar, paste-check flow,
   * report-a-scam form, deadline/passport tracker.
   */
  ENABLE_INTELLIGENCE: (process.env.FF_INTELLIGENCE ?? "true").toLowerCase() !== "false",

  /**
   * Community-lite — Cohort cards, ambassador/peer guide
   * applications, community question capture, admin review.
   */
  ENABLE_COMMUNITY_LITE: (process.env.FF_COMMUNITY_LITE ?? "true").toLowerCase() !== "false",
} as const;

/** Human-readable flag status for admin / QA pages */
export type FeatureFlag = keyof typeof flags;
export type FeatureFlagStatus = { key: FeatureFlag; label: string; enabled: boolean };

export function getAllFlags(): FeatureFlagStatus[] {
  const labels: Record<FeatureFlag, string> = {
    ENABLE_NIA_V2: "Nia 2.0",
    ENABLE_JOURNEY: "Journey Layer",
    ENABLE_INTELLIGENCE: "Intelligence MVP",
    ENABLE_COMMUNITY_LITE: "Community-lite",
  };
  return (Object.keys(flags) as FeatureFlag[]).map((key) => ({
    key,
    label: labels[key],
    enabled: flags[key],
  }));
}

/**
 * Check a single flag — returns true if enabled.
 * Useful for conditional rendering in components.
 */
export function isEnabled(flag: FeatureFlag): boolean {
  return flags[flag] === true;
}
