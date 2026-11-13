"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { errorsFromIssues, invalid, saved, type ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/server/admin-session";
import { getBusinessSettings } from "@/server/content";
import { db } from "@/server/db";
import { required, text } from "@/server/form-data";
import { renderMarkdown } from "@/server/markdown";

const policySchema = z.object({ markdown: required("the policy text", 30000) });

export async function savePolicy(_previous: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = policySchema.safeParse({ markdown: text(formData, "markdown") });
  if (!parsed.success) return invalid(errorsFromIssues(parsed.error.issues));
  // updatedAt changes with every save, and the page shows it as "Last updated".
  await db.privacyPolicy.update({ where: { id: 1 }, data: { markdown: parsed.data.markdown } });
  revalidatePath("/", "layout");
  return saved("Saved ✓ The “Last updated” date is now today.");
}

// The preview shows exactly what the page will: the same cleaning, the same
// {phone} and {email} links.
export async function previewPolicy(markdown: string): Promise<string> {
  await requireAdmin();
  const settings = await getBusinessSettings(db);
  return renderMarkdown(markdown.slice(0, 30000), {
    phone: settings.phone,
    email: settings.email,
    city: settings.serviceAreaCity,
  });
}
