import { describe, expect, test } from "vitest";
import { checkRateLimit, clearAttempts, recordAttempt } from "./rate-limit";
import { createTestDatabase } from "./test-support/test-db";

const rule = { bucket: "login:203.0.113.7", limit: 3, windowMs: 15 * 60_000 };
const at = (minutes: number) => new Date(Date.UTC(2026, 10, 14, 9, minutes));

describe("rate limiting", () => {
  test("allows attempts up to the limit, then refuses", async () => {
    const { db } = await createTestDatabase();

    for (const minute of [0, 1, 2]) {
      expect(await checkRateLimit(db, rule, at(minute))).toBe(true);
      await recordAttempt(db, rule.bucket, at(minute));
    }

    expect(await checkRateLimit(db, rule, at(3))).toBe(false);
  });

  test("allows again once the earlier attempts are older than the window", async () => {
    const { db } = await createTestDatabase();
    for (const minute of [0, 1, 2]) await recordAttempt(db, rule.bucket, at(minute));

    expect(await checkRateLimit(db, rule, at(16))).toBe(true);
  });

  test("one visitor's attempts don't count against another's", async () => {
    const { db } = await createTestDatabase();
    for (const minute of [0, 1, 2]) await recordAttempt(db, rule.bucket, at(minute));

    expect(await checkRateLimit(db, { ...rule, bucket: "login:198.51.100.4" }, at(3))).toBe(true);
  });

  test("clearing a bucket starts its count again", async () => {
    const { db } = await createTestDatabase();
    for (const minute of [0, 1, 2]) await recordAttempt(db, rule.bucket, at(minute));

    await clearAttempts(db, rule.bucket);

    expect(await checkRateLimit(db, rule, at(3))).toBe(true);
  });
});
