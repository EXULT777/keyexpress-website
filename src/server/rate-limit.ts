import type { Db } from "./db";

// Attempts are rows in the database rather than counters in memory, because the
// hosting may run several server processes and restarts idle ones.

export type RateLimitRule = { bucket: string; limit: number; windowMs: number };

const KEEP_ATTEMPTS_MS = 24 * 60 * 60_000;

// True when another attempt is allowed: fewer than `limit` in the last `windowMs`.
export async function checkRateLimit(db: Db, rule: RateLimitRule, now = new Date()): Promise<boolean> {
  const recent = await db.rateLimitHit.count({
    where: { bucket: rule.bucket, createdAt: { gt: new Date(now.getTime() - rule.windowMs) } },
  });
  return recent < rule.limit;
}

export async function recordAttempt(db: Db, bucket: string, now = new Date()): Promise<void> {
  await db.rateLimitHit.create({ data: { bucket, createdAt: now } });
  await db.rateLimitHit.deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - KEEP_ATTEMPTS_MS) } } });
}

export async function clearAttempts(db: Db, bucket: string): Promise<void> {
  await db.rateLimitHit.deleteMany({ where: { bucket } });
}
