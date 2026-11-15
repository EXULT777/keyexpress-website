"use server";

import { z } from "zod";
import { errorsFromIssues, invalid, saved, type ActionResult } from "@/lib/action-result";
import { changeAdminPassword } from "@/server/admin-auth";
import { requireAdmin, startAdminSession } from "@/server/admin-session";
import { db } from "@/server/db";
import { text } from "@/server/form-data";

// The password rules themselves (current one right, 10+ characters, typed twice)
// are checked in changeAdminPassword.
const passwordFields = z.object({
  current: z.string().max(200, "That's too long to be your password."),
  next: z.string().max(200, "Please use 200 characters or fewer."),
  confirm: z.string().max(200, "Please use 200 characters or fewer."),
});

export async function changePassword(_previous: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = passwordFields.safeParse({
    current: text(formData, "current"),
    next: text(formData, "next"),
    confirm: text(formData, "confirm"),
  });
  if (!parsed.success) return invalid(errorsFromIssues(parsed.error.issues));

  const result = await changeAdminPassword(db, admin.id, parsed.data);
  if (result.status === "invalid") return invalid(result.errors);

  // The new session version signs out every other device; this one stays signed in.
  await startAdminSession(result.session);
  return saved("Password changed ✓ Any other phone or computer that was signed in has been signed out.");
}
