import { expect, type Page } from "@playwright/test";

export const ADMIN = { email: "owner@e2e.example", password: "e2e password 123" };

export async function logIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN.email);
  await page.getByLabel("Password").fill(ADMIN.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();
}

// The headings in the order they appear, as a quick picture of a page.
export async function pageHeadings(page: Page) {
  return page.locator("main h2").allInnerTexts();
}
