import path from "node:path";

// Everything the site writes (the database, uploaded images, the session secret)
// lives in one folder outside the code, so replacing the code on a redeploy never
// touches it. See docs/adr/0002-data-folder-outside-the-code.md.
export function dataDir(): string {
  // Decided when the server runs, not at build time, so the build mustn't trace it.
  return path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR || "data");
}

export function databasePath(dir: string = dataDir()): string {
  return path.join(/*turbopackIgnore: true*/ dir, "keyexpress.db");
}

export function databaseUrl(dir: string = dataDir()): string {
  return `file:${databasePath(dir)}`;
}

export function uploadsDir(dir: string = dataDir()): string {
  return path.join(/*turbopackIgnore: true*/ dir, "uploads");
}

// The migration SQL files ship next to the server (see scripts/bundle.mjs).
export function migrationsDir(): string {
  return path.join(process.cwd(), "prisma", "migrations");
}
