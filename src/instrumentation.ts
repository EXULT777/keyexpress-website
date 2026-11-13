// Runs once when a server process starts, before it answers any request.
export async function register() {
  // Only the Node.js server uses the database, and `next build` must never touch
  // it: the site's content lives in the server's database, not in the build.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { prepareDatabase } = await import("./server/database-setup");
  const { dataDir } = await import("./server/paths");

  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  await prepareDatabase({ dataDir: dataDir(), admin: email && password ? { email, password } : null });
}
