import { timingSafeEqual } from "node:crypto";
import "server-only";

/**
 * Constant-time string comparison for bearer tokens/shared secrets, backed by
 * Node's own crypto.timingSafeEqual rather than a hand-rolled XOR loop — avoids
 * relying on loop-timing behavior being consistent across JS engines, and avoids
 * UTF-16-code-unit edge cases with non-ASCII input. Length is checked first since
 * timingSafeEqual requires equal-length buffers; this is standard practice (see
 * Node's own docs) and isn't itself a meaningful timing side-channel.
 */
export function secureEqual(a: string, b: string): boolean {
  const aBytes = Buffer.from(a);
  const bBytes = Buffer.from(b);
  if (aBytes.length !== bBytes.length) return false;
  return timingSafeEqual(aBytes, bBytes);
}
