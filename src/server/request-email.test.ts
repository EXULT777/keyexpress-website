import { describe, expect, test } from "vitest";
import { serviceRequestEmail } from "./request-email";
import type { ServiceRequestRecord } from "./service-requests";

const request: ServiceRequestRecord = {
  id: 7,
  createdAt: new Date("2026-11-14T09:30:00Z"),
  fullName: "Dorothy Miller",
  phone: "(555) 201-3344",
  email: "",
  service: "Smart Keys",
  address: "12 Elm Street, Nearby Town 2",
  message: "",
  emergency: false,
  status: "NEW",
};

const settings = { businessName: "Keys Express", email: "info@keyexpress.example", notificationEmail: "" };

describe("the email about a new Service Request", () => {
  test("goes to the business email when no separate address is set", () => {
    const email = serviceRequestEmail(request, settings);

    expect(email.to).toBe("info@keyexpress.example");
    expect(email.subject).toBe("New service request from Dorothy Miller");
  });

  test("goes to the 'Send new requests to' address when one is set", () => {
    const email = serviceRequestEmail(request, { ...settings, notificationEmail: "owner@example.com" });

    expect(email.to).toBe("owner@example.com");
  });

  test("starts the subject with EMERGENCY when the Customer ticked the emergency box", () => {
    const email = serviceRequestEmail({ ...request, emergency: true }, settings);

    expect(email.subject).toBe("EMERGENCY: New service request from Dorothy Miller");
  });

  test("lists the Customer's details so the request can be handled from the email alone", () => {
    const email = serviceRequestEmail(request, settings);

    expect(email.text).toContain("Phone: (555) 201-3344");
    expect(email.text).toContain("Service: Smart Keys");
    expect(email.text).toContain("Address or area: 12 Elm Street, Nearby Town 2");
  });
});
