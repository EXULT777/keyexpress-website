import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { telHref } from "@/lib/phone";
import type { PlaceholderValues } from "@/lib/placeholders";

const marked = new Marked({ gfm: true });

// Only plain document formatting survives: no scripts, styles, images or
// javascript: links, whatever is typed into the editor.
const allowed: sanitizeHtml.IOptions = {
  allowedTags: ["h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "em", "a", "br", "blockquote", "hr", "code"],
  allowedAttributes: { a: ["href"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  // The page's own title is the one main heading.
  transformTags: { h1: "h2" },
};

function escapeLinkText(text: string) {
  return text.replace(/[[\]\\]/g, "\\$&");
}

export function renderMarkdown(markdown: string, values: PlaceholderValues): string {
  const filled = markdown
    .replaceAll("{phone}", `[${escapeLinkText(values.phone)}](${telHref(values.phone)})`)
    .replaceAll("{email}", `[${escapeLinkText(values.email)}](mailto:${values.email})`)
    .replaceAll("{city}", values.city);
  const html = marked.parse(filled, { async: false });
  return sanitizeHtml(html, allowed).trim();
}
