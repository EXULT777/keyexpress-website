"use server";

import { revalidatePath } from "next/cache";
import { errorsFromIssues, invalid, saved, type ActionResult } from "@/lib/action-result";
import { isSectionKey, pageSections } from "@/lib/page-sections";
import { requireAdmin } from "@/server/admin-session";
import { db } from "@/server/db";
import { checked, text } from "@/server/form-data";

// Badges arrive as badges.0.title, badges.0.text, badges.0.icon, badges.1.title…
function badgesFrom(formData: FormData) {
  const indexes = new Set<number>();
  for (const name of formData.keys()) {
    const match = /^badges\.(\d+)\./.exec(name);
    if (match) indexes.add(Number(match[1]));
  }
  return [...indexes]
    .sort((a, b) => a - b)
    .map((index) => ({
      icon: text(formData, `badges.${index}.icon`),
      title: text(formData, `badges.${index}.title`),
      text: text(formData, `badges.${index}.text`),
    }));
}

export async function savePageSection(key: string, _previous: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!isSectionKey(key)) return { status: "failed", message: "That section doesn't exist." };
  const section = pageSections[key];

  const input: Record<string, unknown> = {};
  for (const [name, field] of Object.entries(section.fields)) {
    input[name] = field.kind === "badges" ? badgesFrom(formData) : text(formData, name);
  }
  const parsed = section.schema.safeParse(input);
  if (!parsed.success) return invalid(errorsFromIssues(parsed.error.issues));

  // Only Home Sections can be hidden; every other section always shows.
  const visible = section.page === "home" ? checked(formData, "visible") : true;
  await db.pageSection.upsert({
    where: { key },
    create: { key, content: parsed.data, visible },
    update: { content: parsed.data, visible },
  });
  revalidatePath("/", "layout");
  return saved();
}
