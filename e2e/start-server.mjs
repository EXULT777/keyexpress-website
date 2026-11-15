// Starts deploy/server.js the way the hosting does, on a brand-new data folder.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const server = path.join(root, "deploy", "server.js");
if (!existsSync(server)) {
  console.error("No deploy/ folder. Run `npm run build && npm run bundle` first (npm run test:e2e does both).");
  process.exit(1);
}

const dataDir = mkdtempSync(path.join(os.tmpdir(), "keyexpress-e2e-"));
const child = spawn(process.execPath, [server], {
  cwd: path.dirname(server),
  stdio: "inherit",
  env: {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    NODE_ENV: "production",
    PORT: "3210",
    HOSTNAME: "127.0.0.1",
    DATA_DIR: dataDir,
    SITE_URL: "http://127.0.0.1:3210",
    ADMIN_EMAIL: "owner@e2e.example",
    ADMIN_PASSWORD: "e2e password 123",
  },
});

function stop() {
  child.kill();
  rmSync(dataDir, { recursive: true, force: true });
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
child.on("exit", (code) => process.exit(code ?? 0));
