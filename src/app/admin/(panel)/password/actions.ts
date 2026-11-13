"use server";

import { invalid, saved, type ActionResult } from "@/lib/action-result";
import { changeAdminPassword } from "@/server/admin-auth";
import { requireAdmin, startAdminSession } from "@/server/admin-session";
import { db } from "@/server/db";
import { text } from "@/server/form-data";

export async function changePassword(_previous: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const result = await changeAdminPassword(db, admin.id, {
    current: text(formData, "current"),
    next: text(formData, "next"),
    confirm: text(formData, "confirm"),
  });
  if (result.status === "invalid") return invalid(result.errors);

  // The new session version signs out every other device; this one stays signed in.
  await startAdminSession(result.session);
  return saved("Password changed ✓ Any other phone or computer that was signed in has been signed out.");
}
