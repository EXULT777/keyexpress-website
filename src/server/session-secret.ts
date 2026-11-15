import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { dataDir } from "./paths";

let cached: Promise<string> | undefined;

// The key that seals the Admin's login cookie: SESSION_SECRET when it's set (32+
// characters), otherwise one generated on first use and kept in DATA_DIR, so it
// survives redeploys without being one more setting to fill in.
export function sessionSecret(): Promise<string> {
  cached ??= loadSecret();
  return cached;
}

async function loadSecret(): Promise<string> {
  const fromEnv = process.env.SESSION_SECRET?.trim();
  if (fromEnv && fromEnv.length >= 32) return fromEnv;
  if (fromEnv) console.warn("SESSION_SECRET is shorter than 32 characters, so a generated one is used instead.");

  const file = path.join(/*turbopackIgnore: true*/ dataDir(), "session-secret");
  try {
    return (await readFile(file, "utf8")).trim();
  } catch {
    const secret = randomBytes(48).toString("base64url");
    try {
      // "wx": only create it if it isn't there, in case another process just did.
      await writeFile(file, secret, { mode: 0o600, flag: "wx" });
      return secret;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") return (await readFile(file, "utf8")).trim();
      throw error;
    }
  }
}
