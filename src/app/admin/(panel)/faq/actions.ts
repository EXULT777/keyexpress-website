"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { errorsFromIssues, invalid, saved, type ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/server/admin-session";
import { db } from "@/server/db";
import { checked, required, text } from "@/server/form-data";
import { nextSortOrder, reorder } from "@/server/ordering";
import { refreshPublicSite } from "@/server/refresh";

const faqSchema = z.object({
  question: required("the question", 200),
  answer: required("the answer", 2000),
  visible: z.boolean(),
});

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
    const highest = await db.faq.aggregate({ _max: { sortOrder: true } });
    const created = await db.faq.create({ data: { ...parsed.data, sortOrder: nextSortOrder(highest._max.sortOrder) } });
    refreshPublicSite();
    redirect(`/admin/faq/${created.id}?added=1`);
  }

  const result = await db.faq.updateMany({ where: { id }, data: parsed.data });
  if (result.count === 0) return { status: "failed", message: "This question was deleted. Please go back to the list." };
  refreshPublicSite();
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
  refreshPublicSite();
  return saved(direction === "up" ? "Moved up ✓" : "Moved down ✓");
}

export async function setFaqVisible(id: number, visible: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.faq.update({ where: { id }, data: { visible } });
  refreshPublicSite();
  return saved(visible ? "Now shown on the website ✓" : "Now hidden from the website ✓");
}

export async function deleteFaq(id: number): Promise<ActionResult> {
  await requireAdmin();
  await db.faq.deleteMany({ where: { id } });
  refreshPublicSite();
  return saved("Question deleted ✓");
}
