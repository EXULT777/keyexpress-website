import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import sharp from "sharp";
import { ADMIN, logIn } from "./helpers";

test.describe("Admin panel", () => {
  test("visitors who aren't logged in are sent to the login page, even for the spreadsheet download", async ({ page }) => {
    for (const path of ["/admin", "/admin/settings", "/admin/requests/export"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login$/);
    }
  });

  test("a wrong password is refused in plain words", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN.email);
    await page.getByLabel("Password").fill("not the password");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByRole("alert").filter({ hasText: "don't match" })).toHaveText(
      "That email and password don't match. Please try again.",
    );
  });

  test("changing the phone number in Business Settings changes it on every page", async ({ page }) => {
    await logIn(page);
    await page.getByRole("link", { name: "Business Settings" }).click();
    await page.getByLabel("Phone number").fill("(555) 300-4000");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved ✓")).toBeVisible();

    try {
      for (const path of ["/", "/contact"]) {
        await page.goto(path);
        await expect(page.locator('a[href="tel:+15553004000"]:visible').first()).toBeVisible();
        await expect(page.locator('a[href="tel:+15550147823"]')).toHaveCount(0);
      }
    } finally {
      // Other tests expect the starter phone number.
      await page.goto("/admin/settings");
      await page.getByLabel("Phone number").fill("(555) 014-7823");
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(page.getByText("Saved ✓")).toBeVisible();
    }
  });

  test("an uploaded logo appears on the website, and the original can be restored", async ({ page }, testInfo) => {
    const logo = testInfo.outputPath("logo.png");
    await sharp({ create: { width: 600, height: 150, channels: 4, background: "#0b2545" } }).png().toFile(logo);
    await logIn(page);
    await page.goto("/admin/settings");

    await page.getByLabel("Choose a new logo").setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: await readFile(logo) });
    await page.getByRole("button", { name: "Upload new logo" }).click();
    await expect(page.getByText("New logo saved ✓")).toBeVisible();
    await page.goto("/");
    const src = await page.locator("header img").first().getAttribute("src");
    expect(src).toMatch(/^\/uploads\/logo-.+\.webp$/);
    expect((await page.request.get(src!)).headers()["content-type"]).toBe("image/webp");

    await page.goto("/admin/settings");
    await page.getByRole("button", { name: "Use the original Key Express logo again" }).click();
    await expect(page.getByText("Default logo restored ✓")).toBeVisible();
    await page.goto("/");
    await expect(page.locator("header img").first()).toHaveAttribute("src", "/logo.svg");
  });

  test("a new Service can be added, hidden from the website, and deleted", async ({ page }) => {
    await logIn(page);
    await page.goto("/admin/services/new");
    await page.getByLabel("Title", { exact: true }).fill("Safe Opening");
    await page.getByLabel("Short description").fill("We open and repair safes.");
    await page.getByLabel("Longer description").fill("We open home and business safes.");
    await page.getByRole("button", { name: "Add this service" }).click();
    await expect(page.getByText("New service added ✓")).toBeVisible();

    await page.goto("/services");
    await expect(page.locator("#safe-opening h2")).toHaveText("Safe Opening");

    await page.goto("/admin/services");
    await page.getByRole("button", { name: /Hide.*Safe Opening/ }).click();
    await expect(page.getByText("Now hidden from the website ✓")).toBeVisible();
    await page.goto("/services");
    await expect(page.locator("#safe-opening")).toHaveCount(0);

    await page.goto("/admin/services");
    await page.getByRole("button", { name: /Delete.*Safe Opening/ }).click();
    await page.getByRole("button", { name: "Yes, delete it" }).click();
    await expect(page.getByText("“Safe Opening” deleted ✓")).toBeVisible();
    await expect(page.locator("ol > li", { hasText: "Safe Opening" })).toHaveCount(0);
  });

  test("Services can be put in a new order", async ({ page }) => {
    await logIn(page);
    await page.goto("/admin/services");
    await page.getByRole("button", { name: /Move down.*European & Foreign Vehicles/ }).click();
    await expect(page.getByText("Moved down ✓")).toBeVisible();

    await page.goto("/");
    const cards = page.locator('section[aria-labelledby="services-heading"] li h3');
    await expect(cards.nth(0)).toHaveText("Domestic Vehicles");
    await expect(cards.nth(1)).toHaveText("European & Foreign Vehicles");

    await page.goto("/admin/services");
    await page.getByRole("button", { name: /Move up.*European & Foreign Vehicles/ }).click();
    await expect(page.getByText("Moved up ✓")).toBeVisible();
  });

  test("a new question can be added to the FAQ and deleted again", async ({ page }) => {
    await logIn(page);
    await page.goto("/admin/faq/new");
    await page.getByLabel("Question", { exact: true }).fill("Do you charge for estimates?");
    await page.getByLabel("Answer", { exact: true }).fill("No. We tell you the price before we start.");
    await page.getByRole("button", { name: "Add this question" }).click();
    await expect(page.getByText("New question added ✓")).toBeVisible();
    await page.goto("/faq");
    await expect(page.getByText("Do you charge for estimates?")).toBeVisible();

    await page.goto("/admin/faq");
    await page.getByRole("button", { name: /Delete.*Do you charge for estimates/ }).click();
    await page.getByRole("button", { name: "Yes, delete it" }).click();
    await expect(page.getByText("Question deleted ✓")).toBeVisible();
    await page.goto("/faq");
    await expect(page.getByText("Do you charge for estimates?")).toHaveCount(0);
  });

  test("a hidden Home Section disappears from the home page, and edited text appears", async ({ page }) => {
    await logIn(page);
    await page.goto("/admin/content");
    const fob = page.locator("details", { hasText: "Key fob highlight" });
    await fob.locator("summary").click();
    await fob.getByLabel("Heading").fill("Key Fob Help Today");
    await fob.getByRole("button", { name: "Save changes" }).click();
    await expect(fob.getByText("Saved ✓")).toBeVisible();
    const accounts = page.locator("details", { hasText: "Business accounts" });
    await accounts.locator("summary").click();
    await accounts.getByLabel("Show this section on the home page").uncheck();
    await accounts.getByRole("button", { name: "Save changes" }).click();
    await expect(accounts.getByText("Saved ✓")).toBeVisible();

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Key Fob Help Today" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Open a Business Account" })).toHaveCount(0);

    await page.goto("/admin/content");
    await page.locator("details", { hasText: "Key fob highlight" }).locator("summary").click();
    await page.locator("details", { hasText: "Key fob highlight" }).getByLabel("Heading").fill("Need a New Key Fob? Get It Done Today");
    await page.locator("details", { hasText: "Key fob highlight" }).getByRole("button", { name: "Save changes" }).click();
    await expect(page.locator("details", { hasText: "Key fob highlight" }).getByText("Saved ✓")).toBeVisible();
    await page.locator("details", { hasText: "Business accounts" }).locator("summary").click();
    await page.locator("details", { hasText: "Business accounts" }).getByLabel("Show this section on the home page").check();
    await page.locator("details", { hasText: "Business accounts" }).getByRole("button", { name: "Save changes" }).click();
    await expect(page.locator("details", { hasText: "Business accounts" }).getByText("Saved ✓")).toBeVisible();
  });

  test("the Privacy Policy preview follows the typing, and saving publishes it", async ({ page }) => {
    await logIn(page);
    await page.goto("/admin/privacy");
    const box = page.getByLabel("Policy text");
    const original = await box.inputValue();
    await box.fill(`${original}\n\n## 13. A Test Section\n\nCall {phone}.`);
    await expect(page.locator(".policy h2", { hasText: "13. A Test Section" })).toBeVisible();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved ✓ The “Last updated” date is now today.")).toBeVisible();

    await page.goto("/privacy-policy");
    await expect(page.getByRole("heading", { name: "13. A Test Section" })).toBeVisible();

    await page.goto("/admin/privacy");
    await page.getByLabel("Policy text").fill(original);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved ✓ The “Last updated” date is now today.")).toBeVisible();
  });

  test("a page's title for Google can be changed", async ({ page }) => {
    await logIn(page);
    await page.goto("/admin/seo");
    const about = page.locator("section", { has: page.getByRole("heading", { name: "About page" }) });
    await about.getByLabel("Page title").fill("About Our Locksmiths | Key Express");
    await about.getByRole("button", { name: "Save changes" }).click();
    await expect(about.getByText("Saved ✓")).toBeVisible();

    await page.goto("/about");
    await expect(page).toHaveTitle("About Our Locksmiths | Key Express");
  });

  test("a request can be marked done, and all requests downloaded as a spreadsheet", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Full name").fill("Harold Jenkins");
    await page.getByLabel("Phone number").fill("555 811 2020");
    await page.getByLabel("Service needed").selectOption("Residential");
    await page.getByLabel("Address or area").fill("3 Maple Ave");
    await page.getByRole("button", { name: "Send Request" }).click();
    await expect(page.getByRole("status")).toContainText("Thank you!");

    await logIn(page);
    await page.goto("/admin/requests");
    const row = page.locator("tbody tr", { hasText: "Harold Jenkins" });
    await row.getByRole("button", { name: /Mark as done/ }).click();
    await expect(page.getByText("Harold Jenkins: marked as Done ✓")).toBeVisible();
    await expect(row.getByText("Done", { exact: true })).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: /Download all as a spreadsheet/ }).click(),
    ]);
    const csv = await readFile((await download.path())!, "utf8");
    expect(csv).toContain("Harold Jenkins,555 811 2020,,Residential,3 Maple Ave,");
  });

  test("logging out returns to the login page and closes the Admin", async ({ page }) => {
    await logIn(page);
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
