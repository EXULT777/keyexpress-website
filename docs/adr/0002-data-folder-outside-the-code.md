# Data lives outside the code, and the server prepares its own database

The site is uploaded to shared hosting where a redeploy replaces the code folder, there may be no shell, and Next.js only serves files that were in `public/` when the site was built. So everything the site writes (the SQLite database, uploaded images, the generated session secret) lives in one folder named by `DATA_DIR`, outside the code, and uploads are served by the `/uploads/[file]` route rather than from `public/uploads` as the spec first said. Each time a server process starts, `src/instrumentation.ts` applies new migrations itself (same `_prisma_migrations` bookkeeping as `prisma migrate deploy`, so the two stay interchangeable), adds the starter content on the very first start, and creates the Admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD` if none exists. A deploy is therefore "upload, restart", and a backup is "copy one folder".

## Consequences

- Pages render on request from the server's database (`dynamic = "force-dynamic"`); nothing is prerendered at build time, because the build machine's database is not the live one.
- Several Passenger processes can start at once: the migration step takes SQLite's write lock, and the starter content and Admin are inserted in ways where losing the race is harmless. `src/server/database-setup.test.ts` covers this with real separate processes.
