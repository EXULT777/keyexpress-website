"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { errorsFromIssues, invalid, saved, type ActionResult } from "@/lib/action-result";
import { isIconName } from "@/lib/icons";
import { requireAdmin } from "@/server/admin-session";
import { db } from "@/server/db";
import { checked, required, text } from "@/server/form-data";
import { nextSortOrder, reorder, uniqueSlug } from "@/server/ordering";
import { dataDir } from "@/server/paths";
import { refreshPublicSite } from "@/server/refresh";
import { deleteUpload, imageFromForm } from "@/server/uploads";

const serviceSchema = z.object({
  title: required("a title", 80),
  shortDescription: required("a short description", 240),
  longDescription: required("the longer description", 4000),
  icon: z.string().refine(isIconName, "Please pick an icon."),
  visible: z.boolean(),
});

// Adds a Service (id null) or saves changes to one.
export async function saveService(id: number | null, _previous: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = serviceSchema.safeParse({
    title: text(formData, "title"),
    shortDescription: text(formData, "shortDescription"),
    longDescription: text(formData, "longDescription"),
    icon: text(formData, "icon"),
    visible: checked(formData, "visible"),
  });
  if (!parsed.success) return invalid(errorsFromIssues(parsed.error.issues));

  const image = await imageFromForm(dataDir(), formData, "service");
  if (!image.ok) return invalid({ image: image.error });
  const { imagePath } = image;

  if (id === null) {
    const [existing, highest] = await Promise.all([
      db.service.findMany({ select: { slug: true } }),
      db.service.aggregate({ _max: { sortOrder: true } }),
    ]);
    const created = await db.service.create({
      data: {
        ...parsed.data,
        imagePath: imagePath ?? null,
        // The service's fixed name in links; it stays the same if the title changes later.
        slug: uniqueSlug(parsed.data.title, new Set(existing.map((service) => service.slug))),
        sortOrder: nextSortOrder(highest._max.sortOrder),
      },
    });
    refreshPublicSite();
    redirect(`/admin/services/${created.id}?added=1`);
  }

  const before = await db.service.findUnique({ where: { id }, select: { imagePath: true } });
  if (!before) return { status: "failed", message: "This service was deleted. Please go back to the list." };
  await db.service.update({ where: { id }, data: { ...parsed.data, ...(imagePath !== undefined && { imagePath }) } });
  if (imagePath !== undefined) await deleteUpload(dataDir(), before.imagePath);
  refreshPublicSite();
  return saved();
}

export async function moveService(id: number, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();
  const services = await db.service.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true } });
  await db.$transaction(
    reorder(services.map((service) => service.id), id, direction).map(({ id: serviceId, sortOrder }) =>
      db.service.update({ where: { id: serviceId }, data: { sortOrder } }),
    ),
  );
  refreshPublicSite();
  return saved(direction === "up" ? "Moved up ✓" : "Moved down ✓");
}

export async function setServiceVisible(id: number, visible: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.service.update({ where: { id }, data: { visible } });
  refreshPublicSite();
  return saved(visible ? "Now shown on the website ✓" : "Now hidden from the website ✓");
}

export async function deleteService(id: number): Promise<ActionResult> {
  await requireAdmin();
  const service = await db.service.findUnique({ where: { id }, select: { imagePath: true, title: true } });
  if (!service) return saved("Deleted ✓");
  await db.service.delete({ where: { id } });
  await deleteUpload(dataDir(), service.imagePath);
  refreshPublicSite();
  return saved(`“${service.title}” deleted ✓`);
}
