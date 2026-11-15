import "server-only";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminForSession, type AdminSession } from "./admin-auth";
import { db } from "./db";
import { sessionSecret } from "./session-secret";
import { siteUrl } from "./site-url";

const WEEK_SECONDS = 7 * 24 * 60 * 60;

async function session() {
  return getIronSession<AdminSession>(await cookies(), {
    password: await sessionSecret(),
    cookieName: "keyexpress_admin",
    ttl: WEEK_SECONDS,
    cookieOptions: {
      httpOnly: true,
      // Sent only over HTTPS once the site has its https:// address.
      secure: siteUrl().startsWith("https://"),
      sameSite: "lax",
      path: "/",
    },
  });
}

export async function startAdminSession(admin: AdminSession) {
  const current = await session();
  current.adminId = admin.adminId;
  current.sessionVersion = admin.sessionVersion;
  await current.save();
}

export async function endAdminSession() {
  (await session()).destroy();
}

export type SignedInAdmin = { id: number; email: string };

// The signed-in Admin, or null. A cookie from before the last password change
// doesn't count.
export async function currentAdmin(): Promise<SignedInAdmin | null> {
  const { adminId, sessionVersion } = await session();
  if (adminId === undefined || sessionVersion === undefined) return null;
  return adminForSession(db, { adminId, sessionVersion });
}

// Every Admin page, server action and route handler calls this first: checking
// only in a layout would leave actions open to direct requests.
export async function requireAdmin(): Promise<SignedInAdmin> {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
