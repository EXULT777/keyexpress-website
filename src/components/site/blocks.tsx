import { ChevronDown } from "lucide-react";
import { NamedIcon } from "@/lib/icons";
import { telHref } from "@/lib/phone";
import type { Faq, Service } from "@/server/content";

export function WhyChooseUsBadges({ badges }: { badges: { icon: string; title: string; text: string }[] }) {
  return (
    <ul className="mt-10 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-5">
      {badges.map((badge) => {
        return (
          <li
            key={badge.title}
            className="flex flex-col items-center rounded-2xl border-2 border-silver bg-white px-3 py-6 text-center last:odd:col-span-2 lg:last:odd:col-span-1"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-action text-white">
              <NamedIcon name={badge.icon} aria-hidden="true" className="size-8" />
            </span>
            <h3 className="mt-4 text-lg md:text-xl">{badge.title}</h3>
            <p className="mt-1 text-lg">{badge.text}</p>
          </li>
        );
      })}
    </ul>
  );
}

export function ServiceCard({ service, phone }: { service: Service; phone: string }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border-2 border-silver bg-white">
      <div className="bg-brushed h-2" />
      <div className="flex flex-1 flex-col p-6">
        <NamedIcon name={service.icon} aria-hidden="true" className="size-10 text-action" />
        <h3 className="mt-4 text-xl">{service.title}</h3>
        <p className="mt-2 flex-1">{service.shortDescription}</p>
        <a
          href={telHref(phone)}
          className="mt-5 inline-flex min-h-12 items-center gap-2 font-bold text-action underline hover:text-action-hover"
        >
          Call for this service
          <span className="sr-only">: {service.title}</span>
        </a>
      </div>
    </li>
  );
}

export function FaqList({ faqs, className }: { faqs: Faq[]; className?: string }) {
  return (
    <div className={className}>
      {faqs.map((item) => (
        <details key={item.id} className="group mb-4 rounded-2xl border-2 border-silver bg-white last:mb-0">
          <summary className="flex min-h-16 items-center justify-between gap-4 rounded-2xl p-5 text-xl font-bold text-navy hover:bg-silver-light">
            {item.question}
            <ChevronDown aria-hidden="true" className="size-7 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <p className="px-5 pb-5">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
