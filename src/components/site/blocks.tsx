import { ChevronDown } from "lucide-react";
import { NamedIcon } from "@/lib/icons";
import { telHref } from "@/lib/phone";
import { fillPlaceholders, type PlaceholderValues } from "@/lib/placeholders";
import type { Faq, Service } from "@/server/content";
import { FilledText, Paragraphs } from "./filled-text";

export function WhyChooseUsBadges({
  badges,
  placeholders,
}: {
  badges: { icon: string; title: string; text: string }[];
  placeholders: PlaceholderValues;
}) {
  return (
    <ul className="mt-10 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-5">
      {badges.map((badge) => (
        <li
          key={badge.title}
          className="flex flex-col items-center rounded-2xl border-2 border-silver bg-white px-3 py-6 text-center last:odd:col-span-2 lg:last:odd:col-span-1"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-action text-white">
            <NamedIcon name={badge.icon} aria-hidden="true" className="size-8" />
          </span>
          <h3 className="mt-4 text-lg md:text-xl">{fillPlaceholders(badge.title, placeholders)}</h3>
          <p className="mt-1 text-lg">
            <FilledText text={badge.text} placeholders={placeholders} />
          </p>
        </li>
      ))}
    </ul>
  );
}

export function ServiceCard({
  service,
  phone,
  callLabel,
  placeholders,
}: {
  service: Service;
  phone: string;
  callLabel: string;
  placeholders: PlaceholderValues;
}) {
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border-2 border-silver bg-white">
      <div className="bg-brushed h-2" />
      <div className="flex flex-1 flex-col p-6">
        <NamedIcon name={service.icon} aria-hidden="true" className="size-10 text-action" />
        <h3 className="mt-4 text-xl">{service.title}</h3>
        <p className="mt-2 flex-1">
          <FilledText text={service.shortDescription} placeholders={placeholders} />
        </p>
        <a
          href={telHref(phone)}
          className="mt-5 inline-flex min-h-12 items-center gap-2 font-bold text-action underline hover:text-action-hover"
        >
          {callLabel}
          <span className="sr-only">: {service.title}</span>
        </a>
      </div>
    </li>
  );
}

export function FaqList({ faqs, placeholders, className }: { faqs: Faq[]; placeholders: PlaceholderValues; className?: string }) {
  return (
    <div className={className}>
      {faqs.map((item) => (
        <details key={item.id} className="group mb-4 rounded-2xl border-2 border-silver bg-white last:mb-0">
          <summary className="flex min-h-16 items-center justify-between gap-4 rounded-2xl p-5 text-xl font-bold text-navy hover:bg-silver-light">
            {fillPlaceholders(item.question, placeholders)}
            <ChevronDown aria-hidden="true" className="size-7 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-3 px-5 pb-5">
            <Paragraphs text={item.answer} placeholders={placeholders} />
          </div>
        </details>
      ))}
    </div>
  );
}
