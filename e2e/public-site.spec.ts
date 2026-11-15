import { expect, test } from "@playwright/test";

const pages = ["/", "/about", "/contact", "/privacy-policy"];

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

  test("the phone number is in the header's Call button at every desktop width", async ({ page }) => {
    for (const width of [1024, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await expect(page.locator("header").getByRole("link", { name: "Call (555) 014-7823", exact: true })).toBeInViewport();
    }
  });

  test("the sticky call bar is on phones and goes away on large screens", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about");
    const bar = page.locator("div.fixed").filter({ has: page.getByRole("link", { name: /Call Now/ }) });
    await expect(bar).toBeVisible();
    await expect(bar.getByRole("link", { name: "Request Service" })).toHaveAttribute("href", "/contact#request");

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(bar).toBeHidden();
    await expect(page.locator("header").getByRole("link", { name: "Call (555) 014-7823", exact: true })).toBeVisible();
  });

  test("the home page padlock shows on phones, tablets and desktops", async ({ page }) => {
    for (const width of [360, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await expect(page.locator(".lock-showcase svg"), `at ${width}px`).toBeInViewport();
    }
  });

  test("the sticky call bar's buttons stay on one line on narrow phones", async ({ page }) => {
    for (const width of [320, 360, 375, 390, 400, 414, 420, 428, 480, 600, 768, 1000]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/about");
      for (const button of await page.locator("div.fixed a").all()) {
        const box = await button.boundingBox();
        expect(box?.height, `${await button.textContent()} at ${width}px`).toBe(56);
        expect(await button.evaluate((link) => link.scrollWidth <= link.clientWidth)).toBe(true);
      }
    }
  });

  test("the phone number shows at the top of every page on phones", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    for (const path of ["/about", "/privacy-policy"]) {
      await page.goto(path);
      await expect(page.getByRole("link", { name: "(555) 014-7823", exact: true }).first()).toBeInViewport();
    }
  });

  test("the sticky call bar steps aside while the visitor types in the form, then comes back", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/contact");
    const bar = page.locator("div.fixed").filter({ has: page.getByRole("link", { name: /Call Now/ }) });
    await expect(bar).toBeVisible();

    await page.getByLabel("Full name").click();
    await expect(bar).toBeHidden();
    await page.getByLabel("Phone number").click();
    await expect(bar).toBeHidden();

    await page.getByRole("heading", { level: 1 }).click();
    await expect(bar).toBeVisible();
  });

  test("each Service tile on the home page calls", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/");
    const tiles = page.locator("#services li a");
    await expect(tiles.first()).toHaveAttribute("href", "tel:+15550147823");
    await expect(tiles.filter({ hasText: "Smart Keys" })).toHaveAccessibleName(/Smart Keys.*Call for this service/);
  });

  test("the phone menu holds the page still, and a tap on the dimmed page closes it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");

    // Below the menu panel and above the sticky call bar.
    await page.mouse.click(200, 650);
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
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

  test("Services and FAQ in the menu scroll to their home page sections", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const menu = page.locator("header").getByRole("navigation", { name: "Main" });
    await page.goto("/about");
    await menu.getByRole("link", { name: "Services" }).click();
    await expect(page).toHaveURL(/\/#services$/);
    await expect(page.locator("#services-heading")).toBeInViewport();

    await menu.getByRole("link", { name: "FAQ" }).click();
    await expect(page).toHaveURL(/\/#faq$/);
    await expect(page.locator("#faq-heading")).toBeInViewport();
    await expect(menu.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");

    // A second click, with the address already /#faq, still scrolls back down.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await menu.getByRole("link", { name: "FAQ" }).click();
    await expect(page.locator("#faq-heading")).toBeInViewport();
  });

  test("coming back to the home page, by link or the Back button, starts at the top", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const menu = page.locator("header").getByRole("navigation", { name: "Main" });
    await page.goto("/");
    await menu.getByRole("link", { name: "Services" }).click();
    await expect(page.locator("#services-heading")).toBeInViewport();

    await menu.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await page.goBack();
    await expect(page.locator("#hero-heading")).toBeInViewport();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    await menu.getByRole("link", { name: "About" }).click();
    await menu.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("the phone menu closes after a tap on a link to a home page section", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "FAQ" }).click();

    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#faq-heading")).toBeInViewport();
  });

  test("the old Services and FAQ addresses go to the home page sections", async ({ page }) => {
    await page.goto("/services");
    await expect(page).toHaveURL(/\/#services$/);
    await page.goto("/faq");
    await expect(page).toHaveURL(/\/#faq$/);
  });

  test("the FAQ answers open like accordions", async ({ page }) => {
    await page.goto("/");
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
    expect(sitemap).toContain("<loc>http://127.0.0.1:3210/about</loc>");
    expect(sitemap).not.toContain("/services");
    expect(sitemap).not.toContain("/faq");
  });

  test("the home page describes the business to search engines as a Locksmith", async ({ page }) => {
    await page.goto("/");
    const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");

    expect(data).toMatchObject({ "@type": "Locksmith", name: "Key Express", telephone: "(555) 014-7823" });
    expect(data.areaServed).toHaveLength(9);
  });
});
