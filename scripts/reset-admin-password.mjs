// Forgot the Admin password? This sets the Admin's email and password to
// ADMIN_EMAIL and ADMIN_PASSWORD and signs out every device. It works in the
// upload folder too (plain Node, no build tools), so on cPanel it can be run with
// "Run JS script" -> reset-admin-password. See DEPLOY.md.
import path from "node:path";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

// Same as src/lib/password.ts (this script runs without TypeScript).
const MIN_PASSWORD_LENGTH = 10;

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";
if (!email || password.length < MIN_PASSWORD_LENGTH) {
  console.error(
    `Set ADMIN_EMAIL and ADMIN_PASSWORD (at least ${MIN_PASSWORD_LENGTH} characters) in the environment variables first.`,
  );
  process.exit(1);
}

const database = path.join(path.resolve(process.env.DATA_DIR || "data"), "keyexpress.db");
const db = createClient({ url: `file:${database}`, timeout: 10_000 });

try {
  const hash = await bcrypt.hash(password, 12);
  // The same text format the app's database driver writes for dates.
  const now = new Date().toISOString().replace("Z", "+00:00");
  const existing = await db.execute(`SELECT id FROM "Admin" ORDER BY id LIMIT 1`);
  if (existing.rows.length > 0) {
    // There is only ever one Admin, so it takes the new email as well.
    await db.execute({
      sql: `UPDATE "Admin" SET email = ?, passwordHash = ?, sessionVersion = sessionVersion + 1, updatedAt = ? WHERE id = ?`,
      args: [email, hash, now, existing.rows[0].id],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO "Admin" (email, passwordHash, sessionVersion, createdAt, updatedAt) VALUES (?, ?, 0, ?, ?)`,
      args: [email, hash, now, now],
    });
  }
  console.log(`Done. Log in at /admin/login as ${email} with the new password.`);
} catch (error) {
  console.error(`Couldn't reset the password in ${database}:`, error.message);
  process.exit(1);
} finally {
  db.close();
}
