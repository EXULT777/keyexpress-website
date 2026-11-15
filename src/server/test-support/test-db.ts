import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach } from "vitest";
import { prepareDatabase } from "../database-setup";
import { openDatabase, type Db } from "../db";

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
});

// A real, migrated database with the starter content, in its own temp folder.
export async function createTestDatabase(options: { admin?: { email: string; password: string } } = {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "keyexpress-test-"));
  cleanups.push(() => rm(dir, { recursive: true, force: true }));
  await prepareDatabase({ dataDir: dir, admin: options.admin ?? null });
  const db: Db = openDatabase(dir);
  cleanups.push(() => db.$disconnect());
  return { db, dir };
}
