"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { errorsFromIssues, invalid, saved, type ActionResult } from "@/lib/action-result";
import { isFullPhoneNumber } from "@/lib/phone";
import { requireAdmin } from "@/server/admin-session";
import { db } from "@/server/db";
import { checked, email, entries, file, optional, required, text } from "@/server/form-data";
import { dataDir } from "@/server/paths";
import { deleteUpload, saveUpload } from "@/server/uploads";

const settingsSchema = z.object({
  businessName: required("the business name", 80),
  phone: required("the phone number", 40).refine(
    isFullPhoneNumber,
    "Please enter the full phone number, including the area code.",
  ),
  email: email(),
  notificationEmail: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "Please enter a full email address, or leave this empty.",
    ),
  serviceAreaCity: required("the city", 80),
  towns: z.array(z.string().max(60, "Please keep each town to 60 characters or fewer.")).max(30, "Please list 30 towns or fewer."),
  paymentMethods: z
    .array(z.string().max(40, "Please keep each payment method to 40 characters or fewer."))
    .max(15, "Please list 15 payment methods or fewer."),
  emergencyBadge: z.boolean(),
  licenseNumber: optional(60),
  footerText: required("the short description for the bottom of the page", 300),
});

export async function saveBusinessSettings(_previous: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    businessName: text(formData, "businessName"),
    phone: text(formData, "phone"),
    email: text(formData, "email"),
    notificationEmail: text(formData, "notificationEmail"),
    serviceAreaCity: text(formData, "serviceAreaCity"),
    towns: entries(formData, "towns"),
    paymentMethods: entries(formData, "paymentMethods"),
    emergencyBadge: checked(formData, "emergencyBadge"),
    licenseNumber: text(formData, "licenseNumber"),
    footerText: text(formData, "footerText"),
  });
  if (!parsed.success) return invalid(errorsFromIssues(parsed.error.issues));

  await db.businessSettings.update({ where: { id: 1 }, data: parsed.data });
  revalidatePath("/", "layout");
  return saved();
}

export async function uploadLogo(_previous: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const logo = file(formData, "logo");
  if (!logo) return invalid({ logo: "Please choose a picture first." });

  const result = await saveUpload(dataDir(), { name: logo.name, bytes: new Uint8Array(await logo.arrayBuffer()) }, "logo");
  if (!result.ok) return invalid({ logo: result.error });

  const before = await db.businessSettings.findUniqueOrThrow({ where: { id: 1 }, select: { logoPath: true } });
  await db.businessSettings.update({ where: { id: 1 }, data: { logoPath: result.url } });
  await deleteUpload(dataDir(), before.logoPath);
  revalidatePath("/", "layout");
  return saved("New logo saved ✓");
}

export async function restoreDefaultLogo(): Promise<ActionResult> {
  await requireAdmin();
  const before = await db.businessSettings.findUniqueOrThrow({ where: { id: 1 }, select: { logoPath: true } });
  await db.businessSettings.update({ where: { id: 1 }, data: { logoPath: null } });
  await deleteUpload(dataDir(), before.logoPath);
  revalidatePath("/", "layout");
  return saved("Default logo restored ✓");
}
