import { describe, expect, test } from "vitest";
import { HONEYPOT_FIELD } from "@/lib/service-request";
import { listServiceRequests, submitServiceRequest } from "./service-requests";
import { createTestDatabase } from "./test-support/test-db";

const complete = {
  fullName: "Dorothy Miller",
  phone: "(555) 201-3344",
  email: "",
  service: "Smart Keys",
  address: "12 Elm Street, Nearby Town 2",
  message: "Lost my only key at the grocery store.",
  emergency: "on",
};

const visitor = { ip: "203.0.113.7" };

describe("sending a Service Request", () => {
  test("a complete request is saved and appears first in the inbox", async () => {
    const { db } = await createTestDatabase();

    const result = await submitServiceRequest(db, complete, visitor);

    expect(result.status).toBe("sent");
    const [newest] = await listServiceRequests(db);
    expect(newest).toMatchObject({
      fullName: "Dorothy Miller",
      phone: "(555) 201-3344",
      service: "Smart Keys",
      address: "12 Elm Street, Nearby Town 2",
      emergency: true,
      status: "NEW",
    });
  });

  test("an empty form gets a plain-words message for each required field and saves nothing", async () => {
    const { db } = await createTestDatabase();

    const result = await submitServiceRequest(db, {}, visitor);

    expect(result).toEqual({
      status: "invalid",
      errors: {
        fullName: "Please enter your name.",
        phone: "Please enter your phone number.",
        service: 'Please choose the service you need, or "Not sure".',
        address: "Please enter your address or the area you're in.",
      },
    });
    expect(await listServiceRequests(db)).toEqual([]);
  });

  test("a phone number without an area code is refused", async () => {
    const { db } = await createTestDatabase();

    const result = await submitServiceRequest(db, { ...complete, phone: "201-3344" }, visitor);

    expect(result).toEqual({
      status: "invalid",
      errors: { phone: "Please enter your full phone number, including the area code." },
    });
  });

  test("email is optional, but one that's given must look like an email address", async () => {
    const { db } = await createTestDatabase();

    const withoutEmail = await submitServiceRequest(db, { ...complete, email: "" }, visitor);
    const withTypo = await submitServiceRequest(db, { ...complete, email: "dorothy.gmail.com" }, visitor);

    expect(withoutEmail.status).toBe("sent");
    expect(withTypo).toEqual({
      status: "invalid",
      errors: { email: "Please check your email address, or leave it empty." },
    });
  });

  test('a service that isn\'t one of the listed Services or "Not sure" is refused', async () => {
    const { db } = await createTestDatabase();

    const notSure = await submitServiceRequest(db, { ...complete, service: "Not sure" }, visitor);
    const madeUp = await submitServiceRequest(db, { ...complete, service: "Safe cracking" }, visitor);

    expect(notSure.status).toBe("sent");
    expect(madeUp).toEqual({
      status: "invalid",
      errors: { service: 'Please choose the service you need, or "Not sure".' },
    });
  });

  test("a spam robot that fills in the hidden field is told it was sent, but nothing is saved", async () => {
    const { db } = await createTestDatabase();

    const result = await submitServiceRequest(db, { ...complete, [HONEYPOT_FIELD]: "https://spam.example" }, visitor);

    expect(result.status).toBe("sent");
    expect(await listServiceRequests(db)).toEqual([]);
  });

  test("after 5 requests in an hour, the same visitor is asked to call instead", async () => {
    const { db } = await createTestDatabase();
    for (let i = 0; i < 5; i++) {
      expect((await submitServiceRequest(db, complete, visitor)).status).toBe("sent");
    }

    const sixth = await submitServiceRequest(db, complete, visitor);
    const someoneElse = await submitServiceRequest(db, complete, { ip: "198.51.100.4" });

    expect(sixth.status).toBe("too-many");
    expect(someoneElse.status).toBe("sent");
    expect(await listServiceRequests(db)).toHaveLength(6);
  });
});
