import { z } from "zod";
import { isIconName } from "./icons";

// Every Page Section's fields, how they are checked, and how the Admin panel
// labels them. Page code reads a section through its key, e.g. "home.hero".

function line(max = 160) {
  return z
    .string()
    .trim()
    .min(1, "Please fill this in.")
    .max(max, `Please keep this to ${max} characters or fewer.`);
}

function text(max = 1500) {
  return z
    .string()
    .trim()
    .min(1, "Please fill this in.")
    .max(max, `Please keep this to ${max} characters or fewer.`);
}

const badge = z.object({
  icon: z.string().refine(isIconName, "Please pick an icon."),
  title: line(60),
  text: line(140),
});

type FieldKind = "line" | "text" | "badges";
type FieldMeta = { label: string; kind: FieldKind };
type Page = "home" | "services" | "about" | "faq" | "contact" | "not-found";

function section<S extends z.ZodObject>(definition: {
  title: string;
  page: Page;
  schema: S;
  fields: { [K in keyof z.infer<S>]-?: FieldMeta };
}) {
  return definition;
}

const heading: FieldMeta = { label: "Heading", kind: "line" };
const paragraph: FieldMeta = { label: "Text", kind: "text" };
const button: FieldMeta = { label: "Button text", kind: "line" };

export const pageSections = {
  "home.hero": section({
    title: "Top of the page",
    page: "home",
    schema: z.object({
      heading: line(),
      text: text(),
      callButton: line(40),
      requestButton: line(40),
      phoneIntro: line(80),
    }),
    fields: {
      heading,
      text: paragraph,
      callButton: { label: "Call button text", kind: "line" },
      requestButton: { label: "Request button text", kind: "line" },
      phoneIntro: { label: "Line above the big phone number", kind: "line" },
    },
  }),
  "home.emergency": section({
    title: "Emergency help, 24/7",
    page: "home",
    schema: z.object({ heading: line(), text: text(), button: line(40) }),
    fields: { heading, text: paragraph, button },
  }),
  "home.business": section({
    title: "Service for businesses",
    page: "home",
    schema: z.object({ heading: line(), text: text(), button: line(40) }),
    fields: { heading, text: paragraph, button },
  }),
  "home.about": section({
    title: "About us",
    page: "home",
    schema: z.object({ heading: line(), text: text(), button: line(40) }),
    fields: { heading, text: paragraph, button: { label: "Button text (opens the About page)", kind: "line" } },
  }),
  "home.whyChooseUs": section({
    title: "Why choose us",
    page: "home",
    schema: z.object({ heading: line(), badges: z.array(badge).min(1, "Please keep at least one badge.").max(8) }),
    fields: { heading, badges: { label: "Badges", kind: "badges" } },
  }),
  "home.services": section({
    title: "Our services",
    page: "home",
    schema: z.object({ heading: line(), text: text(), cardLink: line(40), button: line(40) }),
    fields: {
      heading,
      text: paragraph,
      cardLink: { label: "Link on each service card (calls you)", kind: "line" },
      button: { label: "Button text (opens the Services page)", kind: "line" },
    },
  }),
  "home.fobHighlight": section({
    title: "Key fob highlight",
    page: "home",
    schema: z.object({ heading: line(), text: text(), button: line(40) }),
    fields: { heading, text: paragraph, button },
  }),
  "home.businessAccounts": section({
    title: "Business accounts",
    page: "home",
    schema: z.object({ heading: line(), text: text(), button: line(40) }),
    fields: { heading, text: paragraph, button },
  }),
  "home.request": section({
    title: "Request service form",
    page: "home",
    schema: z.object({ heading: line(), text: text(), button: line(40), successMessage: text(500) }),
    fields: {
      heading,
      text: { label: "Text above the form", kind: "text" },
      button,
      successMessage: { label: "Message after sending", kind: "text" },
    },
  }),
  "home.faq": section({
    title: "Questions and answers",
    page: "home",
    schema: z.object({ heading: line() }),
    fields: { heading },
  }),
  "home.serviceArea": section({
    title: "Areas we serve",
    page: "home",
    schema: z.object({ heading: line(), text: text() }),
    fields: { heading, text: { label: "Text above the list of towns", kind: "text" } },
  }),
  "services.intro": section({
    title: "Services page",
    page: "services",
    schema: z.object({ heading: line(), text: text(), jumpHeading: line(60) }),
    fields: { heading, text: paragraph, jumpHeading: { label: "Heading above the list of service links", kind: "line" } },
  }),
  "about.intro": section({
    title: "About page",
    page: "about",
    schema: z.object({ heading: line(), text: text(5000) }),
    fields: { heading, text: { label: "Text (leave an empty line between paragraphs)", kind: "text" } },
  }),
  "faq.intro": section({
    title: "Questions page",
    page: "faq",
    schema: z.object({ heading: line(), text: text(), closingHeading: line(80), closingText: text(300) }),
    fields: {
      heading,
      text: paragraph,
      closingHeading: { label: "Heading of the box at the end", kind: "line" },
      closingText: { label: "Text of the box at the end", kind: "text" },
    },
  }),
  "contact.intro": section({
    title: "Contact page",
    page: "contact",
    schema: z.object({ heading: line(), text: text() }),
    fields: { heading, text: paragraph },
  }),
  "not-found": section({
    title: "Page not found",
    page: "not-found",
    schema: z.object({ heading: line(), text: text(), button: line(40) }),
    fields: { heading, text: paragraph, button },
  }),
};

export type SectionKey = keyof typeof pageSections;
export type SectionContent<K extends SectionKey> = z.infer<(typeof pageSections)[K]["schema"]>;

export const sectionKeys = Object.keys(pageSections) as SectionKey[];

// Home Sections, top to bottom. Only these can be hidden.
export function isHomeSection(key: SectionKey): boolean {
  return pageSections[key].page === "home";
}

export const homeSectionKeys = sectionKeys.filter(isHomeSection);

export function isSectionKey(value: string): value is SectionKey {
  return Object.hasOwn(pageSections, value);
}
