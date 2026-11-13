import { expect, test } from "@playwright/test";
import { logIn } from "./helpers";

test("a Customer's request gets plain-word problems, then a thank-you, and arrives in the Admin inbox", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Full name").fill("Eleanor Price");
  await page.getByRole("button", { name: "Send Request" }).click();

  const problems = page.locator("form [role=alert]");
  await expect(problems).toContainText("Please fix 3 things below:");
  await expect(problems).toContainText("Please enter your phone number.");
  await expect(page.getByLabel("Full name")).toHaveValue("Eleanor Price");

  await page.getByLabel("Phone number").fill("(555) 640-1188");
  await page.getByLabel("Service needed").selectOption("Transponder Keys");
  await page.getByLabel("Address or area").fill("7 Birch Court, Nearby Town 5");
  await page.getByLabel("Message (optional)").fill("Car won't start with the copy I had made.");
  await page.getByLabel("This is an emergency").check();
  await page.getByRole("button", { name: "Send Request" }).click();

  await expect(page.getByRole("status")).toContainText("Thank you! We received your request and will call you shortly.");

  await logIn(page);
  await page.getByRole("link", { name: /Service Requests/ }).click();
  const row = page.locator("tbody tr", { hasText: "Eleanor Price" });
  await expect(row).toContainText("EMERGENCY");
  await expect(row).toContainText("Transponder Keys");
  await expect(row.getByRole("link", { name: "(555) 640-1188" })).toHaveAttribute("href", "tel:+15556401188");
});
