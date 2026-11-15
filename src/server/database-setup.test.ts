import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, test } from "vitest";
import { verifyAdminLogin } from "./admin-auth";
import { getBusinessSettings } from "./content";
import { prepareDatabase } from "./database-setup";
import { openDatabase, type Db } from "./db";

const execFileAsync = promisify(execFile);

const owner = { email: "owner@example.com", password: "correct horse battery" };

const dirs: string[] = [];
const clients: Db[] = [];

async function freshDataDir() {
  const dir = await mkdtemp(path.join(os.tmpdir(), "keyexpress-test-"));
  dirs.push(dir);
  return dir;
}

function open(dir: string) {
  const db = openDatabase(dir);
  clients.push(db);
  return db;
}

// Each hosting server process has its own SQLite connection and event loop, so
// "at the same time" has to mean separate processes, not promises in this one.
function startServerProcess(dir: string) {
  return execFileAsync(
    process.execPath,
    ["--import", "tsx", path.join(import.meta.dirname, "test-support/start-server-process.ts"), dir, owner.email, owner.password],
    { cwd: process.cwd() },
  );
}

afterEach(async () => {
  await Promise.all(clients.splice(0).map((db) => db.$disconnect()));
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("prepareDatabase", () => {
  test("a fresh data folder gets the starter Business Settings", async () => {
    const dir = await freshDataDir();

    await prepareDatabase({ dataDir: dir, admin: owner });

    const settings = await getBusinessSettings(open(dir));
    expect(settings.phone).toBe("(555) 014-7823");
  });

  test("the Admin from .env can sign in after the first start", async () => {
    const dir = await freshDataDir();

    await prepareDatabase({ dataDir: dir, admin: owner });

    const admin = await verifyAdminLogin(open(dir), owner.email, owner.password);
    expect(admin?.email).toBe(owner.email);
  });

  test("a restart with a different ADMIN_PASSWORD keeps the current password", async () => {
    const dir = await freshDataDir();
    await prepareDatabase({ dataDir: dir, admin: owner });

    await prepareDatabase({ dataDir: dir, admin: { email: owner.email, password: "a different one" } });

    const db = open(dir);
    expect(await verifyAdminLogin(db, owner.email, owner.password)).not.toBeNull();
    expect(await verifyAdminLogin(db, owner.email, "a different one")).toBeNull();
  });

  test("a restart keeps the Admin's edits, and deleted Services stay deleted", async () => {
    const dir = await freshDataDir();
    await prepareDatabase({ dataDir: dir, admin: owner });
    const db = open(dir);
    await db.businessSettings.update({ where: { id: 1 }, data: { phone: "(555) 777-0101" } });
    await db.service.deleteMany();

    await prepareDatabase({ dataDir: dir, admin: owner });

    expect((await getBusinessSettings(db)).phone).toBe("(555) 777-0101");
    expect(await db.service.count()).toBe(0);
  });

  test("Prisma's own migrate status agrees with the migrations applied at startup", { timeout: 60_000 }, async () => {
    const dir = await freshDataDir();
    await prepareDatabase({ dataDir: dir, admin: owner });

    const { stdout } = await execFileAsync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "status"], {
      cwd: process.cwd(),
      env: { ...process.env, DATA_DIR: dir },
    });

    expect(stdout).toContain("Database schema is up to date!");
  });

  test("several server processes starting at once all start cleanly", { timeout: 60_000 }, async () => {
    const dir = await freshDataDir();

    const starts = await Promise.allSettled(Array.from({ length: 4 }, () => startServerProcess(dir)));

    expect(starts.filter((start) => start.status === "rejected")).toEqual([]);
    const db = open(dir);
    expect((await getBusinessSettings(db)).phone).toBe("(555) 014-7823");
    expect(await verifyAdminLogin(db, owner.email, owner.password)).not.toBeNull();
  });
});
