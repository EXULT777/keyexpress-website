// Turns `npm run build` output into deploy/, the folder you upload to the
// hosting (see DEPLOY.md). It holds a self-contained server (server.js plus only
// the node_modules it needs), the static files, and the database migrations,
// which the server applies itself when it starts.
import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "deploy");
const standalone = path.join(root, ".next", "standalone");

try {
  await stat(path.join(standalone, "server.js"));
} catch {
  console.error("No build found. Run `npm run build` first.");
  process.exit(1);
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

await cp(standalone, out, { recursive: true, verbatimSymlinks: false, dereference: true });
await cp(path.join(root, ".next", "static"), path.join(out, ".next", "static"), { recursive: true });
await cp(path.join(root, "public"), path.join(out, "public"), { recursive: true });
await cp(path.join(root, "prisma", "migrations"), path.join(out, "prisma", "migrations"), { recursive: true });

// Never ship local secrets or data: settings come from the hosting's environment
// variables, and the database lives in DATA_DIR on the server.
for (const name of await readdir(out)) {
  if (name.startsWith(".env") || name === "data") {
    await rm(path.join(out, name), { recursive: true, force: true });
  }
}

console.log(`Ready to upload: ${path.relative(process.cwd(), out)}/`);
