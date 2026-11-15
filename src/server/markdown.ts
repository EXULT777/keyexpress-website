import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { telHref } from "@/lib/phone";
import { splitPlaceholders, type PlaceholderValues } from "@/lib/placeholders";

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

export function renderMarkdown(markdown: string, placeholders: PlaceholderValues): string {
  const filled = splitPlaceholders(markdown)
    .map((part) => {
      switch (part.kind) {
        case "text":
          return part.text;
        case "phone":
          return `[${escapeLinkText(placeholders.phone)}](${telHref(placeholders.phone)})`;
        case "email":
          return `[${escapeLinkText(placeholders.email)}](mailto:${placeholders.email})`;
        case "city":
          return placeholders.city;
      }
    })
    .join("");
  const html = marked.parse(filled, { async: false });
  return sanitizeHtml(html, allowed).trim();
}
