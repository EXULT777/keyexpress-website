import { describe, expect, test } from "vitest";
import { renderMarkdown } from "./markdown";

const values = { phone: "(555) 014-7823", email: "info@keyexpress.example", city: "Your City" };

describe("turning the Admin's Markdown into page HTML", () => {
  test("keeps headings, lists, bold text and links", () => {
    const html = renderMarkdown("## Who We Are\n\nWe are **mobile**.\n\n- one\n- two\n\n[Our site](https://keyexpress.example)", values);

    expect(html).toContain("<h2>Who We Are</h2>");
    expect(html).toContain("<strong>mobile</strong>");
    expect(html).toContain("<li>one</li>");
    expect(html).toContain('<a href="https://keyexpress.example">Our site</a>');
  });

  test("removes scripts and event handlers", () => {
    const html = renderMarkdown('Hello <script>alert("x")</script><img src="x" onerror="alert(1)"> there', values);

    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("alert");
  });

  test("removes javascript: links but keeps their text", () => {
    const html = renderMarkdown("[Click me](javascript:alert(1))", values);

    expect(html).not.toContain("javascript:");
    expect(html).toContain("Click me");
  });

  test("fills in {phone} as a tap-to-call link and {email} as an email link", () => {
    const html = renderMarkdown("- Phone: {phone}\n- Email: {email}", values);

    expect(html).toContain('<a href="tel:+15550147823">(555) 014-7823</a>');
    expect(html).toContain('<a href="mailto:info@keyexpress.example">info@keyexpress.example</a>');
  });

  test("turns a top-level # heading into a second-level one, so the page keeps one main heading", () => {
    const html = renderMarkdown("# Our Policy", values);

    expect(html).toBe("<h2>Our Policy</h2>");
  });
});
