import { createHash, randomUUID } from "node:crypto";
import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@libsql/client";
import { createFirstAdmin, isUniqueConstraintError } from "./admin-auth";
import { libsqlConfig, openDatabase, type Db } from "./db";
import { migrationsDir as defaultMigrationsDir, uploadsDir } from "./paths";
import {
  starterFaqs,
  starterPrivacyPolicy,
  starterSections,
  starterServices,
  starterSeo,
  starterSettings,
} from "./starter-content";

type AdminLogin = { email: string; password: string };

// Runs every time the server starts (src/instrumentation.ts), so a deploy is just
// "upload and restart": it creates the data folder, applies new migrations, adds
// the starter content the first time, and creates the Admin if there is none.
export async function prepareDatabase(options: {
  dataDir: string;
  admin?: AdminLogin | null;
  migrationsDir?: string;
}): Promise<void> {
  await mkdir(uploadsDir(options.dataDir), { recursive: true });
  await applyMigrations(options.dataDir, options.migrationsDir ?? defaultMigrationsDir());

  const db = openDatabase(options.dataDir);
  try {
    await addStarterContentOnFirstRun(db);
    if (options.admin) await createFirstAdmin(db, options.admin);
  } finally {
    await db.$disconnect();
  }
}

// Same bookkeeping as `prisma migrate deploy` (the _prisma_migrations table and
// its checksums), so either one can be used on the same database. The hosting has
// no Prisma CLI, which is why the server applies the SQL files itself.
async function applyMigrations(dataDir: string, dir: string) {
  const client = createClient(libsqlConfig(dataDir));
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id"                    TEXT PRIMARY KEY NOT NULL,
      "checksum"              TEXT NOT NULL,
      "finished_at"           DATETIME,
      "migration_name"        TEXT NOT NULL,
      "logs"                  TEXT,
      "rolled_back_at"        DATETIME,
      "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
      "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
    )`);

    // The folder is only known when the server runs; the build mustn't trace it.
    const names = (await readdir(/*turbopackIgnore: true*/ dir, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    // A write transaction takes the database lock, so when several server
    // processes start at once only one applies migrations; the others wait and
    // then find nothing left to do.
    const tx = await client.transaction("write");
    try {
      const applied = await tx.execute(
        `SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL`,
      );
      const done = new Set(applied.rows.map((row) => String(row.migration_name)));

      for (const name of names) {
        if (done.has(name)) continue;
        const file = await readFile(path.join(/*turbopackIgnore: true*/ dir, name, "migration.sql"));
        const startedAt = Date.now();
        await tx.executeMultiple(file.toString("utf8"));
        await tx.execute({
          sql: `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
                VALUES (?, ?, ?, ?, NULL, NULL, ?, 1)`,
          args: [randomUUID(), createHash("sha256").update(file).digest("hex"), Date.now(), name, startedAt],
        });
      }
      await tx.commit();
    } finally {
      tx.close();
    }
  } finally {
    client.close();
  }
}

// The Business Settings row only exists once the starter content is in, so its
// absence means "first start". Later starts leave the Admin's edits alone, even
// when they deleted every Service.
async function addStarterContentOnFirstRun(db: Db) {
  if (await db.businessSettings.findUnique({ where: { id: 1 } })) return;

  try {
    await insertStarterContent(db);
  } catch (error) {
    // Another server process starting at the same moment added it first. The
    // insert is one transaction, so nothing from this attempt was kept.
    if (!isUniqueConstraintError(error)) throw error;
  }
}

function insertStarterContent(db: Db) {
  return db.$transaction([
    db.businessSettings.create({ data: { id: 1, ...starterSettings } }),
    db.pageSection.createMany({
      data: Object.entries(starterSections).map(([key, content]) => ({ key, content })),
    }),
    db.service.createMany({
      data: starterServices.map((service, index) => ({ ...service, sortOrder: index })),
    }),
    db.faq.createMany({
      data: starterFaqs.map((faq, index) => ({ ...faq, sortOrder: index })),
    }),
    db.privacyPolicy.create({ data: { id: 1, markdown: starterPrivacyPolicy } }),
    db.pageSeo.createMany({ data: starterSeo }),
  ]);
}
