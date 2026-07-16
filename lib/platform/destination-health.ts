import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const privateV4 = /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;
const privateV6 = /^(::1|fc|fd|fe80:)/i;

export function validatePublicDestination(value: string): URL {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Destination URL is invalid."); }
  if (url.protocol !== "https:") throw new Error("Destination must use HTTPS.");
  if (url.username || url.password) throw new Error("Destination credentials are prohibited.");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) throw new Error("Local destinations are prohibited.");
  if ((isIP(host) === 4 && privateV4.test(host)) || (isIP(host) === 6 && privateV6.test(host))) throw new Error("Private-network destinations are prohibited.");
  return url;
}

export async function checkDestinationHealth(value: string) {
  const url = validatePublicDestination(value);
  const resolved = await lookup(url.hostname, { all: true });
  if (resolved.some((item) => (item.family === 4 ? privateV4.test(item.address) : privateV6.test(item.address)))) throw new Error("Destination resolves to a private network.");
  const started = performance.now();
  let response = await fetch(url, { method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(8_000), headers: { "User-Agent": "Beginly-Destination-Health/1.3" } });
  if (response.status === 405) response = await fetch(url, { method: "GET", redirect: "manual", signal: AbortSignal.timeout(8_000), headers: { "User-Agent": "Beginly-Destination-Health/1.3", Range: "bytes=0-0" } });
  const location = response.headers.get("location");
  if (location) validatePublicDestination(new URL(location, url).toString());
  return { hostname: url.hostname, statusCode: response.status, healthy: response.status >= 200 && response.status < 400, latencyMs: Math.round(performance.now() - started), redirect: location, checkedAt: new Date().toISOString() };
}
