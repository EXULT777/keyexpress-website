import nodemailer from "nodemailer";
import type { ServiceRequestRecord } from "./service-requests";

type EmailSettings = { businessName: string; email: string; notificationEmail: string };

export function serviceRequestEmail(request: ServiceRequestRecord, settings: EmailSettings, inboxUrl?: string) {
  const subject = `${request.emergency ? "EMERGENCY: " : ""}New service request from ${request.fullName}`;
  const lines = [
    request.emergency ? "The customer marked this as an EMERGENCY." : null,
    `Name: ${request.fullName}`,
    `Phone: ${request.phone}`,
    `Email: ${request.email || "(not given)"}`,
    `Service: ${request.service}`,
    `Address or area: ${request.address}`,
    `Message: ${request.message || "(none)"}`,
    "",
    inboxUrl ? `See all requests: ${inboxUrl}` : null,
  ];
  return {
    to: settings.notificationEmail || settings.email,
    subject,
    text: lines.filter((line) => line !== null).join("\n"),
  };
}

// Sends the email when SMTP is set up in the environment variables. Without
// SMTP_HOST it does nothing: the request is already saved in the Admin inbox.
export async function sendServiceRequestEmail(
  request: ServiceRequestRecord,
  settings: EmailSettings,
  inboxUrl: string,
): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) return;

  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD ?? "" } : undefined,
  });
  const email = serviceRequestEmail(request, settings, inboxUrl);
  await transport.sendMail({
    from: process.env.SMTP_FROM?.trim() || process.env.SMTP_USER || settings.email,
    to: email.to,
    replyTo: request.email || undefined,
    subject: email.subject,
    text: email.text,
  });
}
