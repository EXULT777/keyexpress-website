import bcrypt from "bcryptjs";
import type { Db } from "./db";

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
