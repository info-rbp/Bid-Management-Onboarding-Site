type BucketEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, BucketEntry>();

function now() {
  return Date.now();
}

function pruneExpiredBuckets(currentTime: number) {
  for (const [key, entry] of buckets.entries()) {
    if (entry.resetAt <= currentTime) {
      buckets.delete(key);
    }
  }
}

export function rateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const currentTime = now();
  pruneExpiredBuckets(currentTime);

  const existing = buckets.get(params.key);

  if (!existing || existing.resetAt <= currentTime) {
    const nextEntry = {
      count: 1,
      resetAt: currentTime + params.windowMs,
    };
    buckets.set(params.key, nextEntry);
    return {
      ok: true,
      remaining: params.limit - 1,
      resetAt: nextEntry.resetAt,
    };
  }

  if (existing.count >= params.limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  buckets.set(params.key, existing);

  return {
    ok: true,
    remaining: params.limit - existing.count,
    resetAt: existing.resetAt,
  };
}
