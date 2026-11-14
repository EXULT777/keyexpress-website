import { z } from "zod";
import {
  HONEYPOT_FIELD,
  isRequestStatus,
  NOT_SURE,
  type RequestErrors,
  type RequestField,
  type RequestStatus,
} from "@/lib/service-request";
import { isFullPhoneNumber } from "@/lib/phone";
import { listServices } from "./content";
import type { Db } from "./db";
import { checkRateLimit, recordAttempt, type RateLimitRule } from "./rate-limit";

const CHOOSE_SERVICE = 'Please choose the service you need, or "Not sure".';

// The form's rules. `services` is what the Service dropdown offers right now.
const fieldsFor = (services: Set<string>) => z.object({
  fullName: z.string().trim().min(1, "Please enter your name.").max(100, "Please shorten your name to 100 characters."),
  phone: z
    .string()
    .trim()
    .min(1, "Please enter your phone number.")
    .refine(isFullPhoneNumber, "Please enter your full phone number, including the area code."),
  email: z
    .string()
    .trim()
    .max(200, "Please check your email address, or leave it empty.")
    .refine((email) => email === "" || z.email().safeParse(email).success, "Please check your email address, or leave it empty."),
  service: z
    .string()
    .trim()
    .refine((service) => services.has(service), CHOOSE_SERVICE),
  address: z
    .string()
    .trim()
    .min(1, "Please enter your address or the area you're in.")
    .max(300, "Please shorten the address to 300 characters."),
  message: z.string().trim().max(2000, "Please shorten your message to 2,000 characters."),
  emergency: z.boolean(),
});

const HOUR = 60 * 60_000;

// Requests one visitor can send per hour. When the server can't tell visitors
// apart, everyone shares one count, so that limit is much higher.
function rateLimitFor(ip: string | null): RateLimitRule {
  return ip
    ? { bucket: `request:${ip}`, limit: 5, windowMs: HOUR }
    : { bucket: "request:unknown-visitor", limit: 30, windowMs: HOUR };
}

export type SubmitResult =
  | { status: "sent"; request?: ServiceRequestRecord }
  | { status: "invalid"; errors: RequestErrors }
  | { status: "too-many" };

type RawFields = Record<string, string | undefined>;

export async function submitServiceRequest(
  db: Db,
  raw: RawFields,
  visitor: { ip: string | null },
): Promise<SubmitResult> {
  if (raw[HONEYPOT_FIELD]) return { status: "sent" };

  const rule = rateLimitFor(visitor.ip);
  if (!(await checkRateLimit(db, rule))) return { status: "too-many" };

  const services = new Set([...(await listServices(db, { visibleOnly: true })).map((s) => s.title), NOT_SURE]);
  const parsed = fieldsFor(services).safeParse({
    fullName: raw.fullName ?? "",
    phone: raw.phone ?? "",
    email: raw.email ?? "",
    service: raw.service ?? "",
    address: raw.address ?? "",
    message: raw.message ?? "",
    emergency: raw.emergency === "on" || raw.emergency === "true",
  });
  if (!parsed.success) {
    const errors: RequestErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as RequestField;
      errors[field] ??= issue.message;
    }
    return { status: "invalid", errors };
  }

  await recordAttempt(db, rule.bucket);
  const saved = await db.serviceRequest.create({ data: parsed.data });
  return { status: "sent", request: { ...saved, status: "NEW" } };
}

export type ServiceRequestRecord = {
  id: number;
  createdAt: Date;
  fullName: string;
  phone: string;
  email: string;
  service: string;
  address: string;
  message: string;
  emergency: boolean;
  status: RequestStatus;
};

export async function listServiceRequests(db: Db): Promise<ServiceRequestRecord[]> {
  const rows = await db.serviceRequest.findMany({ orderBy: [{ createdAt: "desc" }, { id: "desc" }] });
  return rows.map((row) => ({ ...row, status: isRequestStatus(row.status) ? row.status : "NEW" }));
}

export async function countServiceRequests(db: Db, now = new Date()) {
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60_000);
  const [newRequests, newEmergencies, lastSevenDays] = await Promise.all([
    db.serviceRequest.count({ where: { status: "NEW" } }),
    db.serviceRequest.count({ where: { status: "NEW", emergency: true } }),
    db.serviceRequest.count({ where: { createdAt: { gte: weekAgo } } }),
  ]);
  return { newRequests, newEmergencies, lastSevenDays };
}
