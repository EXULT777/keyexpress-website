import { ClipboardList } from "lucide-react";
import Image from "next/image";
import { ButtonLink, CallButton } from "@/components/site/buttons";
import { FilledText, Paragraphs } from "@/components/site/filled-text";
import { PageHeader } from "@/components/site/site-chrome";
import { NamedIcon } from "@/lib/icons";
import { fillPlaceholders } from "@/lib/placeholders";
import { pageMetadata } from "@/server/page-metadata";
import { getPlaceholderValues, getSections, getSettings, getVisibleServices } from "@/server/site-data";

export function generateMetadata() {
  return pageMetadata("/services");
}

export default async function ServicesPage() {
  const [settings, sections, services, placeholders] = await Promise.all([
    getSettings(),
    getSections(),
    getVisibleServices(),
    getPlaceholderValues(),
  ]);
  const intro = sections["services.intro"].content;

  return (
    <>
      <PageHeader title={fillPlaceholders(intro.heading, placeholders)}>
        <p>
          <FilledText text={intro.text} placeholders={placeholders} />
        </p>
      </PageHeader>

      {services.length > 1 && (
        <nav aria-labelledby="service-list-heading" className="border-b-2 border-silver bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <h2 id="service-list-heading" className="text-xl">
              {fillPlaceholders(intro.jumpHeading, placeholders)}
            </h2>
            <ul className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <li key={service.id}>
                  <a
                    href={`#${service.slug}`}
                    className="inline-flex min-h-11 items-center font-bold text-action underline hover:text-action-hover"
                  >
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {services.map((service, index) => (
          <article
            key={service.id}
            id={service.slug}
            aria-labelledby={`${service.slug}-heading`}
            className="grid scroll-mt-4 gap-8 border-b-2 border-silver-soft py-12 last:border-b-0 md:grid-cols-[1fr_auto] md:py-16"
          >
            <div className="max-w-3xl">
              <div className="flex items-center gap-4">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-silver-light text-action">
                  <NamedIcon name={service.icon} aria-hidden="true" className="size-9" />
                </span>
                <h2 id={`${service.slug}-heading`} className="text-[1.75rem] md:text-4xl">
                  {service.title}
                </h2>
              </div>
              <Paragraphs text={service.longDescription} placeholders={placeholders} className="mt-4" />
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <CallButton phone={settings.phone} label="Call for this service" />
                <ButtonLink href="/contact#request" variant="secondary">
                  <ClipboardList aria-hidden="true" className="size-6 shrink-0" />
                  Request Service
                </ButtonLink>
              </div>
            </div>
            {service.imageUrl && (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-silver md:w-80">
                <Image
                  src={service.imageUrl}
                  alt={service.title}
                  fill
                  sizes="(min-width: 768px) 320px, 100vw"
                  loading={index < 2 ? "eager" : "lazy"}
                  // Photos are resized for each screen; SVG drawings are shown as they are.
                  unoptimized={service.imageUrl.endsWith(".svg")}
                  className="object-cover"
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
