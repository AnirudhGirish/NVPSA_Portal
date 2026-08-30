type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const MAX_ENTRIES = 10_000;
const WINDOW_MS = 60_000;

function prune() {
  if (buckets.size <= MAX_ENTRIES) {
    return;
  }
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

/**
 * Simple fixed-window per-key rate limiter (in-memory, per serverless instance).
 * Returns true when the request is allowed.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = WINDOW_MS
): boolean {
  prune();

  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count += 1;
  return true;
}
