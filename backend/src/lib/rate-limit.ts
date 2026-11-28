interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export function checkExpressRateLimit(
  clientIp: string,
  scope: string,
  limit = 30,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const key = `${scope}:${clientIp || "local-client"}`;

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
  const recent = bucket.timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    const oldest = recent[0] ?? now;
    const resetMs = Math.max(1000, windowMs - (now - oldest));
    buckets.set(key, { timestamps: recent });
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetMs,
    };
  }

  recent.push(now);
  buckets.set(key, { timestamps: recent });

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - recent.length),
    resetMs: windowMs,
  };
}
