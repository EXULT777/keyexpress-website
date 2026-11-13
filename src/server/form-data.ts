import { z } from "zod";

// Reading Admin form fields, and the checks most forms share.

export function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function checked(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

// Every non-empty entry sent under `name` (list editors send one per row).
export function entries(formData: FormData, name: string): string[] {
  return formData
    .getAll(name)
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
}

export function file(formData: FormData, name: string): File | null {
  const value = formData.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}

export function required(what: string, max = 160) {
  return z
    .string()
    .trim()
    .min(1, `Please enter ${what}.`)
    .max(max, `Please keep this to ${max} characters or fewer.`);
}

export function optional(max = 160) {
  return z.string().trim().max(max, `Please keep this to ${max} characters or fewer.`);
}

export function email(message = "Please enter a full email address, like name@example.com.") {
  return z
    .string()
    .trim()
    .refine((value) => z.email().safeParse(value).success, message);
}
