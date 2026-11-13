import { statusLabels } from "@/lib/service-request";
import type { ServiceRequestRecord } from "./service-requests";

// A value a spreadsheet would run as a formula. Anyone can type into the public
// form, so such values get a leading ' to stay plain text.
const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value: string): string {
  const safe = FORMULA_START.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

function received(date: Date): string {
  const iso = date.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

export function serviceRequestsToCsv(requests: ServiceRequestRecord[]): string {
  const lines = [
    ["Received", "Emergency", "Status", "Name", "Phone", "Email", "Service", "Address or area", "Message"],
    ...requests.map((request) => [
      received(request.createdAt),
      request.emergency ? "Yes" : "No",
      statusLabels[request.status],
      request.fullName,
      request.phone,
      request.email,
      request.service,
      request.address,
      request.message,
    ]),
  ];
  // The byte-order mark tells Excel the file is UTF-8.
  return `﻿${lines.map((line) => line.map(cell).join(",")).join("\r\n")}\r\n`;
}
