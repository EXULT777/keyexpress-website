// Admin-edited text can say {phone}, {email} or {city}; pages fill in the current
// Business Settings, so each of those facts is stored in exactly one place.

export type PlaceholderValues = { phone: string; email: string; city: string };

export function placeholderValues(settings: { phone: string; email: string; serviceAreaCity: string }): PlaceholderValues {
  return { phone: settings.phone, email: settings.email, city: settings.serviceAreaCity };
}

export type TextPart = { kind: "text"; text: string } | { kind: "phone" } | { kind: "email" } | { kind: "city" };

const TOKEN = /\{(phone|email|city)\}/g;

// The one place that finds placeholders. Callers decide how each part is shown:
// plain text, a link, or Markdown.
export function splitPlaceholders(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    if (match.index > last) parts.push({ kind: "text", text: text.slice(last, match.index) });
    parts.push({ kind: match[1] as "phone" | "email" | "city" });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ kind: "text", text: text.slice(last) });
  return parts;
}

// For plain text such as headings, button labels and page titles.
export function fillPlaceholders(text: string, values: PlaceholderValues): string {
  return splitPlaceholders(text)
    .map((part) => (part.kind === "text" ? part.text : values[part.kind]))
    .join("");
}

export function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
