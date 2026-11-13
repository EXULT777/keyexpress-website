import bcrypt from "bcryptjs";
import type { Db } from "./db";
import { checkRateLimit, clearAttempts, recordAttempt, type RateLimitRule } from "./rate-limit";

export type AdminIdentity = { id: number; email: string; sessionVersion: number };

const BCRYPT_COST = 12;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_COST);
}

// Compared against when the email is unknown, so a wrong email takes as long to
// reject as a wrong password and the response time doesn't reveal which it was.
let unknownEmailHash: Promise<string> | undefined;

export async function verifyAdminLogin(db: Db, email: string, password: string): Promise<AdminIdentity | null> {
  const admin = await db.admin.findUnique({ where: { email: normalizeEmail(email) } });
  if (!admin) {
    unknownEmailHash ??= hashPassword("unknown email, never matches");
    await bcrypt.compare(password, await unknownEmailHash);
    return null;
  }
  if (!(await bcrypt.compare(password, admin.passwordHash))) return null;
  return { id: admin.id, email: admin.email, sessionVersion: admin.sessionVersion };
}

// Only ever creates the first Admin. Once one exists, ADMIN_EMAIL and
// ADMIN_PASSWORD are ignored, so restarting the server never resets a password.
export async function createFirstAdmin(db: Db, login: { email: string; password: string }): Promise<boolean> {
  if ((await db.admin.count()) > 0) return false;
  try {
    await db.admin.create({
      data: { email: normalizeEmail(login.email), passwordHash: await hashPassword(login.password) },
    });
    return true;
  } catch (error) {
    // Another server process starting at the same moment created it first.
    if (isUniqueConstraintError(error)) return false;
    throw error;
  }
}

export function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

// What the login cookie holds. sessionVersion must match the Admin's, so raising
// it (on a password change) signs out every older session.
export type AdminSession = { adminId: number; sessionVersion: number };

export type LoginResult = { status: "signed-in"; session: AdminSession } | { status: "wrong" } | { status: "too-many" };

// 5 wrong tries per 15 minutes. Counted per IP address, so someone guessing
// can't lock the owner out from their own phone; per email when the IP is unknown.
function loginLimit(email: string, ip: string | null): RateLimitRule {
  return { bucket: ip ? `login:${ip}` : `login:email:${normalizeEmail(email)}`, limit: 5, windowMs: 15 * 60_000 };
}

export async function logIn(
  db: Db,
  credentials: { email: string; password: string },
  visitor: { ip: string | null },
  now = new Date(),
): Promise<LoginResult> {
  const rule = loginLimit(credentials.email, visitor.ip);
  if (!(await checkRateLimit(db, rule, now))) return { status: "too-many" };

  const admin = await verifyAdminLogin(db, credentials.email, credentials.password);
  if (!admin) {
    await recordAttempt(db, rule.bucket, now);
    return { status: "wrong" };
  }
  await clearAttempts(db, rule.bucket);
  return { status: "signed-in", session: { adminId: admin.id, sessionVersion: admin.sessionVersion } };
}

export async function isSessionCurrent(db: Db, session: AdminSession): Promise<boolean> {
  const admin = await db.admin.findUnique({ where: { id: session.adminId }, select: { sessionVersion: true } });
  return admin?.sessionVersion === session.sessionVersion;
}

export const MIN_PASSWORD_LENGTH = 10;

export type PasswordErrors = Partial<Record<"current" | "next" | "confirm", string>>;

export async function changeAdminPassword(
  db: Db,
  adminId: number,
  input: { current: string; next: string; confirm: string },
): Promise<{ status: "changed"; session: AdminSession } | { status: "invalid"; errors: PasswordErrors }> {
  const admin = await db.admin.findUnique({ where: { id: adminId } });
  if (!admin || !(await bcrypt.compare(input.current, admin.passwordHash))) {
    return { status: "invalid", errors: { current: "That isn't your current password." } };
  }
  if (input.next.length < MIN_PASSWORD_LENGTH) {
    return {
      status: "invalid",
      errors: { next: `Please use at least ${MIN_PASSWORD_LENGTH} characters. A short sentence is easy to remember.` },
    };
  }
  if (input.next !== input.confirm) {
    return { status: "invalid", errors: { confirm: "The two new passwords don't match. Please type them again." } };
  }
  const updated = await db.admin.update({
    where: { id: adminId },
    data: { passwordHash: await hashPassword(input.next), sessionVersion: { increment: 1 } },
  });
  return { status: "changed", session: { adminId, sessionVersion: updated.sessionVersion } };
}
