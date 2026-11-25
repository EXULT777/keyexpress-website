import { ChevronDown, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { NamedIcon } from "@/lib/icons";
import { telHref } from "@/lib/phone";
import { fillPlaceholders, type PlaceholderValues } from "@/lib/placeholders";
import type { Faq, Service } from "@/server/content";
import { FilledText, Paragraphs } from "./filled-text";

const iconTones = {
  blue: "bg-linear-to-br from-royal to-action shadow-[0_10px_24px_-10px_rgb(20_39_155/0.6)]",
  red: "bg-linear-to-br from-emergency to-[#8e1c1c] shadow-[0_10px_24px_-10px_rgb(198_40_40/0.6)]",
  // See-through, for the dark blue bands.
  glass: "bg-white/10 ring-1 ring-white/25",
};

// The rounded square that holds an icon on cards and in the highlight blocks.
export function IconTile({
  children,
  tone = "blue",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof iconTones;
  className?: string;
}) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-2xl text-white", iconTones[tone], className)}>
      {children}
    </span>
  );
}

export function WhyChooseUsBadges({
  badges,
  placeholders,
}: {
  badges: { icon: string; title: string; text: string }[];
  placeholders: PlaceholderValues;
}) {
  return (
    <ul className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:gap-6 lg:grid-cols-5">
      {badges.map((badge) => (
        <li
          key={badge.title}
          className="flex min-w-0 flex-col items-center rounded-2xl border border-silver bg-white px-3 py-5 text-center shadow-[0_14px_34px_-22px_rgb(20_39_155/0.25)] last:odd:col-span-2 md:py-6 lg:last:odd:col-span-1"
        >
          <IconTile className="size-12 md:size-16">
            <NamedIcon name={badge.icon} aria-hidden="true" className="size-6 md:size-8" />
          </IconTile>
          <h3 className="mt-3 text-lg [overflow-wrap:anywhere] md:mt-4 md:text-xl">{fillPlaceholders(badge.title, placeholders)}</h3>
          <p className="mt-1 text-lg leading-snug">
            <FilledText text={badge.text} placeholders={placeholders} />
          </p>
        </li>
      ))}
    </ul>
  );
}

// The Services list. Each Service is one tile, and the whole tile calls. On phones the
// tiles are small squares two to a row with the icon and title; from 768px they grow
// into cards with the short description too, three to a row from 1024px and four
// from 1280px. Rows are centred, so a last row that
// isn't full (any number of Services) still looks deliberate.
export function ServiceTiles({
  services,
  phone,
  callLabel,
  placeholders,
}: {
  services: Service[];
  phone: string;
  callLabel: string;
  placeholders: PlaceholderValues;
}) {
  return (
    <ul className="mt-8 flex flex-wrap justify-center gap-3 md:mt-10 md:gap-6">
      {services.map((service) => (
        <li
          key={service.id}
          className="min-w-0 basis-[calc(50%-0.375rem)] md:basis-[calc(50%-0.75rem)] lg:basis-[calc((100%-3rem)/3)] xl:basis-[calc((100%-4.5rem)/4)]"
        >
          <a
            href={telHref(phone)}
            className="service-tile group relative flex h-full flex-col overflow-hidden rounded-2xl border border-silver bg-white p-4 text-ink no-underline shadow-[0_14px_34px_-22px_rgb(20_39_155/0.3)] md:p-6"
          >
            <span aria-hidden="true" className="bg-electric absolute inset-x-0 top-0 h-1" />
            <span className="flex items-start justify-between gap-2">
              <IconTile className="size-12 md:size-14">
                <NamedIcon name={service.icon} aria-hidden="true" className="size-6 md:size-7" />
              </IconTile>
              {/* On phones the label is too long for the tile, so a phone badge stands in for it. */}
              <span
                aria-hidden="true"
                className="service-tile-call flex size-9 items-center justify-center rounded-full bg-silver-soft text-action md:hidden"
              >
                <Phone className="size-[1.125rem]" strokeWidth={2.5} />
              </span>
            </span>
            <h3 className="mt-3 text-[1.0625rem] leading-snug [overflow-wrap:anywhere] hyphens-auto md:mt-4 md:text-xl">
              {service.title}
            </h3>
            <span className="mt-2 hidden flex-1 md:block">
              <FilledText text={service.shortDescription} placeholders={placeholders} plain />
            </span>
            <span className="mt-4 hidden items-center gap-2 font-bold text-action underline group-hover:text-action-hover md:inline-flex">
              <Phone aria-hidden="true" className="size-5 shrink-0" strokeWidth={2.5} />
              {callLabel}
            </span>
            <span className="sr-only md:hidden">{callLabel}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

const cardShadow = "shadow-[0_20px_44px_-28px_rgb(20_39_155/0.35)]";

const calloutTones = {
  // Emergency: a white card with a red icon, the one place besides the 24/7 badge
  // that uses the emergency red.
  alert: { card: cn("border border-silver bg-white", cardShadow), icon: "red" },
  // A white card on the silver bands.
  card: { card: cn("border border-silver bg-white", cardShadow), icon: "blue" },
  // A soft blue card with a gradient edge, for the key fob offer.
  highlight: { card: cn("callout-highlight", cardShadow), icon: "blue" },
  // The dark banner: no card, it sits on the navy band itself.
  dark: { card: null, icon: "glass" },
} as const;

// A heading, a few lines and one button, with an icon. The home page's four
// highlight blocks (Emergency, Business, Key Fob, Business Account) use it, each in
// its own tone. Side by side from 768px; stacked, with a full-width button, on phones.
export function Callout({
  icon,
  tone,
  children,
  action,
}: {
  icon: ReactNode;
  tone: keyof typeof calloutTones;
  children: ReactNode;
  action: ReactNode;
}) {
  const styles = calloutTones[tone];
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10",
        styles.card && cn("rounded-3xl p-5 sm:p-8 md:p-10", styles.card),
      )}
    >
      <div className="flex max-w-3xl flex-col gap-4 sm:flex-row sm:gap-6">
        <IconTile tone={styles.icon} className="size-12 sm:size-16 [&>svg]:size-6 sm:[&>svg]:size-9">
          {icon}
        </IconTile>
        <div className="min-w-0">{children}</div>
      </div>
      <div className="shrink-0 [&>a]:w-full md:[&>a]:w-auto">{action}</div>
    </div>
  );
}

export function FaqList({ faqs, placeholders, className }: { faqs: Faq[]; placeholders: PlaceholderValues; className?: string }) {
  return (
    <div className={cn("space-y-3 md:space-y-4", className)}>
      {faqs.map((item) => (
        <details
          key={item.id}
          className="group rounded-2xl border border-silver bg-white shadow-[0_10px_28px_-22px_rgb(20_39_155/0.2)] open:border-periwinkle/60"
        >
          <summary className="flex min-h-16 items-center justify-between gap-3 rounded-2xl p-4 text-lg font-bold text-navy hover:bg-silver-soft md:gap-4 md:p-5 md:text-xl">
            <span className="min-w-0">{fillPlaceholders(item.question, placeholders)}</span>
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-silver-soft text-action transition-[transform,background-color] group-open:rotate-180 group-open:bg-action group-open:text-white"
            >
              <ChevronDown className="size-6" />
            </span>
          </summary>
          <div className="faq-answer space-y-3 px-4 pb-5 md:px-5">
            <Paragraphs text={item.answer} placeholders={placeholders} />
          </div>
        </details>
      ))}
    </div>
  );
}
