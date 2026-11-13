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
export function FilledText({ text, values, tone = "light" }: { text: string; values: PlaceholderValues; tone?: Tone }) {
  return splitPlaceholders(text).map((part, index) => {
    switch (part.kind) {
      case "text":
        return <Fragment key={index}>{part.text}</Fragment>;
      case "phone":
        return (
          <a key={index} href={telHref(values.phone)} className={cn(linkTone[tone], "whitespace-nowrap")}>
            {values.phone}
          </a>
        );
      case "email":
        return (
          <a key={index} href={`mailto:${values.email}`} className={linkTone[tone]}>
            {values.email}
          </a>
        );
      case "city":
        return <Fragment key={index}>{values.city}</Fragment>;
    }
  });
}

export function Paragraphs({
  text,
  values,
  tone,
  className,
}: {
  text: string;
  values: PlaceholderValues;
  tone?: Tone;
  className?: string;
}) {
  return toParagraphs(text).map((paragraph, index) => (
    <p key={index} className={className}>
      <FilledText text={paragraph} values={values} tone={tone} />
    </p>
  ));
}
