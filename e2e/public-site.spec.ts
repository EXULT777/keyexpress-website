import { expect, test } from "@playwright/test";

const pages = ["/", "/services", "/about", "/faq", "/contact", "/privacy-policy"];

test.describe("the public website", () => {
  for (const path of pages) {
    test(`${path} has one main heading, a tap-to-call number, and fits a 360px phone`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(path);

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('a[href="tel:+15550147823"]:visible').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
    });
  }

  test("no page scrolls sideways on a tablet or a small laptop", async ({ page }) => {
    for (const width of [768, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of pages) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${path} at ${width}px`).toBe(0);
      }
    }
  });

  test("the big phone number is in the header at every desktop width", async ({ page }) => {
    for (const width of [1024, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await expect(page.locator("header").getByRole("link", { name: "(555) 014-7823", exact: true }).filter({ visible: true })).toHaveCount(1);
      await expect(page.locator("header").getByRole("link", { name: /Call Now/ })).toBeInViewport();
    }
  });

  test("the sticky call bar is on phones and goes away on large screens", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/services");
    const bar = page.locator("div.fixed").filter({ has: page.getByRole("link", { name: /Call Now/ }) });
    await expect(bar).toBeVisible();
    await expect(bar.getByRole("link", { name: "Request Service" })).toHaveAttribute("href", "/contact#request");

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(bar).toBeHidden();
    await expect(page.locator("header").getByRole("link", { name: /Call Now/ })).toBeVisible();
  });

  test("the keyboard reaches the skip link first, and it jumps to the content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("the phone menu opens from the keyboard and closes with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Menu" });
    await menuButton.focus();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("button", { name: "Close" })).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "FAQ" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(menuButton).toBeFocused();
  });

  test("the FAQ answers open like accordions", async ({ page }) => {
    await page.goto("/faq");
    const question = page.getByText("Do you really work 24 hours a day?");
    const answer = page.getByText("Emergency lockout help is available 24 hours a day");
    await expect(answer).toBeHidden();

    await question.click();

    await expect(answer).toBeVisible();
  });

  test("an unknown address shows the friendly not-found page", async ({ page }) => {
    const response = await page.goto("/no-such-page");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sorry, We Can't Find That Page");
    await expect(page.getByRole("link", { name: "Go to Home" })).toHaveAttribute("href", "/");
  });

  test("search engines are kept out of the Admin and given a sitemap", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    const sitemap = await (await request.get("/sitemap.xml")).text();

    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Sitemap: http://127.0.0.1:3210/sitemap.xml");
    expect(sitemap).toContain("<loc>http://127.0.0.1:3210/services</loc>");
  });

  test("the home page describes the business to search engines as a Locksmith", async ({ page }) => {
    await page.goto("/");
    const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");

    expect(data).toMatchObject({ "@type": "Locksmith", name: "Key Express", telephone: "(555) 014-7823" });
    expect(data.areaServed).toHaveLength(9);
  });
});
