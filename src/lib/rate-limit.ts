import type { NextRequest } from "next/server";

interface Bucket {
  timestamps: number[];
}

const globalRateStore = globalThis as typeof globalThis & {
  __shieldlyRateBuckets?: Map<string, Bucket>;
};

const buckets =
  globalRateStore.__shieldlyRateBuckets ?? new Map<string, Bucket>();
globalRateStore.__shieldlyRateBuckets = buckets;

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export function getClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "local-client";
}

export function checkRateLimit(
  req: NextRequest,
  scope: string,
  limit = 30,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const key = `${scope}:${getClientIdentifier(req)}`;

  // Opportunistic cleanup so memory stays bounded
  if (buckets.size > 5000) {
    for (const [k, v] of buckets.entries()) {
      const fresh = v.timestamps.filter((t) => now - t < windowMs);
      if (fresh.length === 0) {
        buckets.delete(k);
      } else {
        v.timestamps = fresh;
      }
    }
  }

  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetMs: Math.max(0, windowMs - (now - oldest)),
    };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    resetMs: windowMs,
  };
}
