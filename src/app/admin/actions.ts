"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { logIn } from "@/server/admin-auth";
import { endAdminSession, startAdminSession } from "@/server/admin-session";
import { db } from "@/server/db";
import { visitorIp } from "@/server/visitor-ip";

export type LoginState = { status: "idle" } | { status: "wrong" | "too-many" | "missing"; email: string };

export async function logInAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email.trim() || !password) return { status: "missing", email };

  const result = await logIn(db, { email, password }, { ip: visitorIp(await headers()) });
  if (result.status !== "signed-in") return { status: result.status, email };

  await startAdminSession(result.session);
  redirect("/admin");
}

export async function logOutAction() {
  await endAdminSession();
  redirect("/admin/login");
}
