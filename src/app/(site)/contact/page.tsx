import { Clock, Mail, MapPin } from "lucide-react";
import { PhoneNumberLink } from "@/components/site/buttons";
import { FilledText } from "@/components/site/filled-text";
import { LocalBusinessJsonLd } from "@/components/site/local-business-json-ld";
import { RequestServiceForm } from "@/components/site/request-form";
import { PageHeader } from "@/components/site/site-chrome";
import { pageMetadata } from "@/server/page-metadata";
import { getPlaceholderValues, getSections, getSettings, getVisibleServices } from "@/server/site-data";

export function generateMetadata() {
  return pageMetadata("/contact");
}

export default async function ContactPage() {
  const [settings, sections, services, values] = await Promise.all([
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
      <PageHeader title={intro.heading}>
        <p>
          <FilledText text={intro.text} values={values} />
        </p>
      </PageHeader>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1fr_1.4fr]">
        <section aria-labelledby="reach-us-heading" className="space-y-6">
          <h2 id="reach-us-heading" className="text-[1.75rem] md:text-3xl">
            Call or Email Us
          </h2>
          <div>
            <p className="font-bold text-navy">Phone, any time</p>
            <PhoneNumberLink phone={settings.phone} className="mt-1 text-3xl text-navy hover:text-action md:text-4xl" />
          </div>
          <p className="flex items-start gap-3">
            <Mail aria-hidden="true" className="mt-1 size-6 shrink-0 text-action" />
            <span>
              <span className="block font-bold text-navy">Email</span>
              <a href={`mailto:${settings.email}`} className="break-all text-action underline hover:text-action-hover">
                {settings.email}
              </a>
            </span>
          </p>
          <p className="flex items-start gap-3">
            <Clock aria-hidden="true" className="mt-1 size-6 shrink-0 text-action" />
            <span>
              <span className="block font-bold text-navy">Hours</span>
              Open 24/7 for emergencies
            </span>
          </p>
          <div className="flex items-start gap-3">
            <MapPin aria-hidden="true" className="mt-1 size-6 shrink-0 text-action" />
            <div>
              <p className="font-bold text-navy">Service area</p>
              <p>
                {settings.serviceAreaCity}
                {settings.towns.length > 0 && `, ${settings.towns.join(", ")}`}
              </p>
            </div>
          </div>
        </section>

        <section id="request" aria-labelledby="request-heading" className="scroll-mt-4">
          <h2 id="request-heading" className="text-[1.75rem] md:text-3xl">
            {request.heading}
          </h2>
          <p className="mt-4 text-xl">
            <FilledText text={request.text} values={values} />
          </p>
          <RequestServiceForm
            services={services.map((service) => service.title)}
            buttonLabel={request.button}
            successMessage={request.successMessage}
            values={values}
          />
        </section>
      </div>
    </>
  );
}
