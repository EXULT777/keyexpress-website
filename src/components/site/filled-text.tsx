import { Fragment } from "react";
import { cn } from "@/lib/cn";
import { telHref } from "@/lib/phone";
import { splitPlaceholders, toParagraphs, type PlaceholderValues } from "@/lib/placeholders";

type Tone = "light" | "dark";

const linkTone: Record<Tone, string> = {
  light: "font-bold text-action underline hover:text-action-hover",
  dark: "font-bold text-white underline",
};

// Admin text with {phone}, {email} and {city} filled in. The phone number and
// email become links, so every phone number on the site can be tapped to call.
export function FilledText({
  text,
  placeholders,
  tone = "light",
}: {
  text: string;
  placeholders: PlaceholderValues;
  tone?: Tone;
}) {
  return splitPlaceholders(text).map((part, index) => {
    switch (part.kind) {
      case "text":
        return <Fragment key={index}>{part.text}</Fragment>;
      case "phone":
        return (
          <a key={index} href={telHref(placeholders.phone)} className={cn(linkTone[tone], "whitespace-nowrap")}>
            {placeholders.phone}
          </a>
        );
      case "email":
        return (
          <a key={index} href={`mailto:${placeholders.email}`} className={linkTone[tone]}>
            {placeholders.email}
          </a>
        );
      case "city":
        return <Fragment key={index}>{placeholders.city}</Fragment>;
    }
  });
}

export function Paragraphs({
  text,
  placeholders,
  tone,
  className,
}: {
  text: string;
  placeholders: PlaceholderValues;
  tone?: Tone;
  className?: string;
}) {
  return toParagraphs(text).map((paragraph, index) => (
    <p key={index} className={className}>
      <FilledText text={paragraph} placeholders={placeholders} tone={tone} />
    </p>
  ));
}
