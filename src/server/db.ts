import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";
import { databaseUrl, dataDir } from "./paths";

export type Db = PrismaClient;

// libsql fails at once with SQLITE_BUSY when another server process is writing.
// Waiting up to 10 seconds for the lock instead is plenty for this site's writes.
export function libsqlConfig(dir: string = dataDir()) {
  return { url: databaseUrl(dir), timeout: 10_000 };
}

export function openDatabase(dir: string = dataDir()): Db {
  return new PrismaClient({ adapter: new PrismaLibSql(libsqlConfig(dir)) });
}

// One client per server process. `next dev` reloads modules on every change, so
// the client is kept on globalThis to stop each reload from opening another one.
const globalForDb = globalThis as unknown as { keyExpressDb?: Db };

export const db: Db = globalForDb.keyExpressDb ?? openDatabase();

if (process.env.NODE_ENV !== "production") globalForDb.keyExpressDb = db;
