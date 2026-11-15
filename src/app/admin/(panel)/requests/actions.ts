"use server";

import { revalidatePath } from "next/cache";
import { saved, type ActionResult } from "@/lib/action-result";
import { isRequestStatus, statusLabels } from "@/lib/service-request";
import { requireAdmin } from "@/server/admin-session";
import { db } from "@/server/db";

export async function setRequestStatus(id: number, status: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isRequestStatus(status)) return { status: "failed", message: "That status doesn't exist." };
  const request = await db.serviceRequest.update({ where: { id }, data: { status }, select: { fullName: true } });
  revalidatePath("/admin", "layout");
  return saved(`${request.fullName}: marked as ${statusLabels[status]} ✓`);
}

export async function deleteRequest(id: number): Promise<ActionResult> {
  await requireAdmin();
  await db.serviceRequest.deleteMany({ where: { id } });
  revalidatePath("/admin", "layout");
  return saved("Request deleted ✓");
}
