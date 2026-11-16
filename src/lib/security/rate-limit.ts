import "server-only";

/**
 * Small in-memory sliding-window limiter (per server instance). Good enough to stop
 * abuse of a single function instance; swap for a shared store (e.g. Redis/Upstash)
 * when running many instances.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}

export function clientIp(headers: Headers) {
  return headers.get("x-nf-client-connection-ip") ?? headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
}
