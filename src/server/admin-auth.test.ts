import { describe, expect, test } from "vitest";
import { changeAdminPassword, isSessionCurrent, logIn } from "./admin-auth";
import { createTestDatabase } from "./test-support/test-db";

const owner = { email: "owner@example.com", password: "correct horse battery" };
const from = { ip: "203.0.113.7" };
const at = (minutes: number) => new Date(Date.UTC(2026, 10, 14, 9, minutes));

describe("Admin login", () => {
  test("the right email and password sign in, whatever the email's capitals", async () => {
    const { db } = await createTestDatabase({ admin: owner });

    const result = await logIn(db, { email: " Owner@Example.com ", password: owner.password }, from);

    expect(result.status).toBe("signed-in");
  });

  test("a wrong password is refused", async () => {
    const { db } = await createTestDatabase({ admin: owner });

    const result = await logIn(db, { email: owner.email, password: "wrong" }, from);

    expect(result.status).toBe("wrong");
  });

  test("after 5 wrong tries, even the right password is refused for 15 minutes", async () => {
    const { db } = await createTestDatabase({ admin: owner });
    for (let minute = 0; minute < 5; minute++) {
      await logIn(db, { email: owner.email, password: "guess" }, from, at(minute));
    }

    const locked = await logIn(db, owner, from, at(6));
    const later = await logIn(db, owner, from, at(20));

    expect(locked.status).toBe("too-many");
    expect(later.status).toBe("signed-in");
  });
});

describe("changing the Admin password", () => {
  test("needs the current password", async () => {
    const { db } = await createTestDatabase({ admin: owner });
    const signedIn = await logIn(db, owner, from);
    if (signedIn.status !== "signed-in") throw new Error("expected to sign in");

    const result = await changeAdminPassword(db, signedIn.session.adminId, {
      current: "not it",
      next: "a brand new password",
      confirm: "a brand new password",
    });

    expect(result).toEqual({ status: "invalid", errors: { current: "That isn't your current password." } });
  });

  test("needs at least 10 characters, typed the same way twice", async () => {
    const { db } = await createTestDatabase({ admin: owner });
    const signedIn = await logIn(db, owner, from);
    if (signedIn.status !== "signed-in") throw new Error("expected to sign in");

    const short = await changeAdminPassword(db, signedIn.session.adminId, {
      current: owner.password,
      next: "short",
      confirm: "short",
    });
    const mismatch = await changeAdminPassword(db, signedIn.session.adminId, {
      current: owner.password,
      next: "a brand new password",
      confirm: "a brand new pasword",
    });

    expect(short).toEqual({
      status: "invalid",
      errors: { next: "Please use at least 10 characters. A short sentence is easy to remember." },
    });
    expect(mismatch).toEqual({
      status: "invalid",
      errors: { confirm: "The two new passwords don't match. Please type them again." },
    });
  });

  test("lets the new password sign in, and signs out every session from before", async () => {
    const { db } = await createTestDatabase({ admin: owner });
    const signedIn = await logIn(db, owner, from);
    if (signedIn.status !== "signed-in") throw new Error("expected to sign in");

    const result = await changeAdminPassword(db, signedIn.session.adminId, {
      current: owner.password,
      next: "a brand new password",
      confirm: "a brand new password",
    });

    expect(result.status).toBe("changed");
    expect(await isSessionCurrent(db, signedIn.session)).toBe(false);
    expect((await logIn(db, { email: owner.email, password: "a brand new password" }, from)).status).toBe("signed-in");
    expect((await logIn(db, owner, from)).status).toBe("wrong");
  });
});
