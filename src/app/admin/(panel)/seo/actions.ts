"use server";

import { z } from "zod";
import { errorsFromIssues, invalid, saved, type ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/server/admin-session";
import { db } from "@/server/db";
import { required, text } from "@/server/form-data";
import { dataDir } from "@/server/paths";
import { refreshPublicSite } from "@/server/refresh";
import { deleteUpload, imageFromForm } from "@/server/uploads";

const seoSchema = z.object({
  title: required("a page title", 120),
  description: required("a description", 320),
});

export async function savePageSeo(path: string, _previous: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const before = await db.pageSeo.findUnique({ where: { path } });
  if (!before) return { status: "failed", message: "That page doesn't exist." };

  const parsed = seoSchema.safeParse({ title: text(formData, "title"), description: text(formData, "description") });
  if (!parsed.success) return invalid(errorsFromIssues(parsed.error.issues));

  const image = await imageFromForm(dataDir(), formData, "social");
  if (!image.ok) return invalid({ image: image.error });
  const ogImagePath = image.imagePath;

  await db.pageSeo.update({ where: { path }, data: { ...parsed.data, ...(ogImagePath !== undefined && { ogImagePath }) } });
  if (ogImagePath !== undefined) await deleteUpload(dataDir(), before.ogImagePath);
  refreshPublicSite();
  return saved();
}
