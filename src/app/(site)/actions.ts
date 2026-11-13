"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import type { RequestErrors } from "@/lib/service-request";
import { getBusinessSettings } from "@/server/content";
import { db } from "@/server/db";
import { sendServiceRequestEmail } from "@/server/request-email";
import { submitServiceRequest } from "@/server/service-requests";
import { siteUrl } from "@/server/site-url";
import { visitorIp } from "@/server/visitor-ip";

export type FormValues = Partial<Record<"fullName" | "phone" | "email" | "service" | "address" | "message" | "emergency", string>>;

export type RequestFormState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "invalid"; errors: RequestErrors; values: FormValues }
  | { status: "too-many"; values: FormValues }
  | { status: "failed"; values: FormValues };

const FIELDS = ["fullName", "phone", "email", "service", "address", "message", "emergency"] as const;

export async function sendServiceRequest(_previous: RequestFormState, formData: FormData): Promise<RequestFormState> {
  const raw: Record<string, string> = {};
  for (const [name, value] of formData) if (typeof value === "string") raw[name] = value;
  // Sent back with any problem, so the form keeps what the person typed.
  const values = Object.fromEntries(FIELDS.map((field) => [field, raw[field] ?? ""])) as FormValues;

  try {
    const result = await submitServiceRequest(db, raw, { ip: visitorIp(await headers()) });
    if (result.status === "invalid") return { status: "invalid", errors: result.errors, values };
    if (result.status === "too-many") return { status: "too-many", values };

    const request = result.request;
    if (request) {
      const settings = await getBusinessSettings(db);
      // Email after the response, so the Customer isn't kept waiting on the mail server.
      after(async () => {
        try {
          await sendServiceRequestEmail(request, settings, `${siteUrl()}/admin/requests`);
        } catch (error) {
          console.error("The new Service Request was saved, but emailing it failed:", error);
        }
      });
    }
    return { status: "sent" };
  } catch (error) {
    console.error("Saving a Service Request failed:", error);
    return { status: "failed", values };
  }
}
