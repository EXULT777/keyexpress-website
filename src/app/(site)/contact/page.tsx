import { Clock, Mail, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { PhoneNumberLink } from "@/components/site/buttons";
import { FilledText } from "@/components/site/filled-text";
import { LocalBusinessJsonLd } from "@/components/site/local-business-json-ld";
import { RequestServiceForm } from "@/components/site/request-form";
import { PageHeader } from "@/components/site/site-chrome";
import { cn } from "@/lib/cn";
import { fillPlaceholders } from "@/lib/placeholders";
import { pageMetadata } from "@/server/page-metadata";
import { getPlaceholderValues, getSections, getSettings, getVisibleServices } from "@/server/site-data";

export function generateMetadata() {
  return pageMetadata("/contact");
}

export default async function ContactPage() {
  const [settings, sections, services, placeholders] = await Promise.all([
    getSettings(),
    getSections(),
    getVisibleServices(),
    getPlaceholderValues(),
  ]);
  const intro = sections["contact.intro"].content;
  const request = sections["home.request"].content;

  return (
    <>
      <LocalBusinessJsonLd settings={settings} services={services} />
      <PageHeader title={fillPlaceholders(intro.heading, placeholders)}>
        <p>
          <FilledText text={intro.text} placeholders={placeholders} tone="dark" />
        </p>
      </PageHeader>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:py-16 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
        <section aria-labelledby="reach-us-heading">
          <h2 id="reach-us-heading" className="text-[1.75rem] md:text-3xl">
            Call or Email Us
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <li className="on-dark bg-night rounded-2xl p-5 text-white sm:col-span-2 lg:col-span-1">
              <p className="font-bold text-sky">Phone, any time</p>
              <PhoneNumberLink phone={settings.phone} tone="dark" className="mt-1 text-[1.75rem] min-[400px]:text-3xl" />
            </li>
            <ContactCard icon={<Mail aria-hidden="true" className="size-6" />} title="Email">
              <a href={`mailto:${settings.email}`} className="break-all text-action underline hover:text-action-hover">
                {settings.email}
              </a>
            </ContactCard>
            <ContactCard icon={<Clock aria-hidden="true" className="size-6" />} title="Hours">
              Open 24/7 for emergencies
            </ContactCard>
            <ContactCard icon={<MapPin aria-hidden="true" className="size-6" />} title="Service area" wide>
              {settings.serviceAreaCity}
              {settings.towns.length > 0 && `, ${settings.towns.join(", ")}`}
            </ContactCard>
          </ul>
        </section>

        <section id="request" aria-labelledby="request-heading" className="md:rounded-3xl md:border md:border-silver md:p-8 md:shadow-[0_20px_44px_-28px_rgb(20_39_155/0.35)]">
          <h2 id="request-heading" className="text-[1.75rem] md:text-3xl">
            {fillPlaceholders(request.heading, placeholders)}
          </h2>
          <p className="mt-4 text-lg md:text-xl">
            <FilledText text={request.text} placeholders={placeholders} />
          </p>
          <RequestServiceForm
            services={services.map((service) => service.title)}
            buttonLabel={fillPlaceholders(request.button, placeholders)}
            successMessage={request.successMessage}
            placeholders={placeholders}
          />
        </section>
      </div>
    </>
  );
}

function ContactCard({ icon, title, wide, children }: { icon: ReactNode; title: string; wide?: boolean; children: ReactNode }) {
  return (
    <li className={cn("flex items-start gap-4 rounded-2xl border border-silver bg-white p-5", wide && "sm:col-span-2 lg:col-span-1")}>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-silver-soft text-action">{icon}</span>
      <div className="min-w-0">
        <p className="font-bold text-navy">{title}</p>
        <p>{children}</p>
      </div>
    </li>
  );
}
