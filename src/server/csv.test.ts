import { describe, expect, test } from "vitest";
import { serviceRequestsToCsv } from "./csv";
import type { ServiceRequestRecord } from "./service-requests";

const base: ServiceRequestRecord = {
  id: 1,
  createdAt: new Date("2026-11-14T09:30:00Z"),
  fullName: "Dorothy Miller",
  phone: "(555) 201-3344",
  email: "",
  service: "Smart Keys",
  address: "12 Elm Street",
  message: "",
  emergency: true,
  status: "NEW",
};

function rows(csv: string) {
  return csv.replace(/^﻿/, "").split("\r\n").filter(Boolean);
}

describe("downloading Service Requests as a spreadsheet (CSV)", () => {
  test("starts with a header row, then one row per request in the order given", () => {
    const csv = serviceRequestsToCsv([base, { ...base, id: 2, fullName: "Walter Brooks", emergency: false, status: "DONE" }]);

    expect(rows(csv)).toEqual([
      "Received,Emergency,Status,Name,Phone,Email,Service,Address or area,Message",
      "2026-11-14 09:30 UTC,Yes,New,Dorothy Miller,(555) 201-3344,,Smart Keys,12 Elm Street,",
      "2026-11-14 09:30 UTC,No,Done,Walter Brooks,(555) 201-3344,,Smart Keys,12 Elm Street,",
    ]);
  });

  test("starts with a byte-order mark so Excel reads accented names correctly", () => {
    expect(serviceRequestsToCsv([]).startsWith("﻿")).toBe(true);
  });

  test("quotes values with commas, quotes or line breaks", () => {
    const csv = serviceRequestsToCsv([
      { ...base, address: "12 Elm Street, Apt 4", message: 'She said "hurry"\nGate code 1234' },
    ]);

    expect(csv).toContain('"12 Elm Street, Apt 4","She said ""hurry""\nGate code 1234"');
  });

  test("stops a spreadsheet from treating a value as a formula", () => {
    const csv = serviceRequestsToCsv([
      { ...base, fullName: '=HYPERLINK("http://evil.example","Click")', message: "@SUM(A1)", phone: "+1 555 201 3344" },
    ]);

    expect(csv).toContain(`"'=HYPERLINK(""http://evil.example"",""Click"")"`);
    expect(csv).toContain("'@SUM(A1)");
    expect(csv).toContain("'+1 555 201 3344");
  });
});
