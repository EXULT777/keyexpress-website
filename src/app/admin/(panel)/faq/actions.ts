"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { errorsFromIssues, invalid, saved, type ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/server/admin-session";
import { db } from "@/server/db";
import { checked, required, text } from "@/server/form-data";
import { reorder } from "@/server/ordering";

const faqSchema = z.object({
  question: required("the question", 200),
  answer: required("the answer", 2000),
  visible: z.boolean(),
});

function changed() {
  revalidatePath("/", "layout");
}

// Adds a question (id null) or saves changes to one.
export async function saveFaq(id: number | null, _previous: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = faqSchema.safeParse({
    question: text(formData, "question"),
    answer: text(formData, "answer"),
    visible: checked(formData, "visible"),
  });
  if (!parsed.success) return invalid(errorsFromIssues(parsed.error.issues));

  if (id === null) {
    const last = await db.faq.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
    const created = await db.faq.create({ data: { ...parsed.data, sortOrder: (last?.sortOrder ?? -1) + 1 } });
    changed();
    redirect(`/admin/faq/${created.id}?added=1`);
  }

  const result = await db.faq.updateMany({ where: { id }, data: parsed.data });
  if (result.count === 0) return { status: "failed", message: "This question was deleted. Please go back to the list." };
  changed();
  return saved();
}

export async function moveFaq(id: number, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();
  const faqs = await db.faq.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true } });
  await db.$transaction(
    reorder(faqs.map((faq) => faq.id), id, direction).map(({ id: faqId, sortOrder }) =>
      db.faq.update({ where: { id: faqId }, data: { sortOrder } }),
    ),
  );
  changed();
  return saved(direction === "up" ? "Moved up ✓" : "Moved down ✓");
}

export async function setFaqVisible(id: number, visible: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.faq.update({ where: { id }, data: { visible } });
  changed();
  return saved(visible ? "Now shown on the website ✓" : "Now hidden from the website ✓");
}

export async function deleteFaq(id: number): Promise<ActionResult> {
  await requireAdmin();
  await db.faq.deleteMany({ where: { id } });
  changed();
  return saved("Question deleted ✓");
}
