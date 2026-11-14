"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logIn } from "@/server/admin-auth";
import { endAdminSession, startAdminSession } from "@/server/admin-session";
import { db } from "@/server/db";
import { text } from "@/server/form-data";
import { visitorIp } from "@/server/visitor-ip";

export type LoginState = { status: "idle" } | { status: "wrong" | "too-many" | "missing"; email: string };

const loginSchema = z.object({
  email: z.string().trim().min(1).max(200),
  // bcrypt only reads the first 72 bytes, so nothing longer is worth hashing.
  password: z.string().min(1).max(200),
});

export async function logInAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = text(formData, "email");
  const parsed = loginSchema.safeParse({ email, password: text(formData, "password") });
  if (!parsed.success) return { status: "missing", email };

  const result = await logIn(db, parsed.data, { ip: visitorIp(await headers()) });
  if (result.status !== "signed-in") return { status: result.status, email };

  await startAdminSession(result.session);
  redirect("/admin");
}

export async function logOutAction() {
  await endAdminSession();
  redirect("/admin/login");
}
