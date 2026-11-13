import { Building2, ClipboardList, MapPin, Siren, Smartphone } from "lucide-react";
import { ButtonLink, CallButton, PhoneNumberLink } from "@/components/site/buttons";
import { FilledText, Paragraphs } from "@/components/site/filled-text";
import { FaqList, ServiceCard, WhyChooseUsBadges } from "@/components/site/blocks";
import { KeyIllustration } from "@/components/site/key-illustration";
import { RequestServiceForm } from "@/components/site/request-form";
import { Section, SectionHeading } from "@/components/site/section";
import { getPlaceholderValues, getSections, getSettings, getVisibleFaqs, getVisibleServices } from "@/server/site-data";
import { pageMetadata } from "@/server/page-metadata";

export function generateMetadata() {
  return pageMetadata("/");
}

export default async function HomePage() {
  const [settings, sections, services, faqs, values] = await Promise.all([
    getSettings(),
    getSections(),
    getVisibleServices(),
    getVisibleFaqs(),
    getPlaceholderValues(),
  ]);
  const hero = sections["home.hero"];
  const emergency = sections["home.emergency"];
  const business = sections["home.business"];
  const about = sections["home.about"];
  const why = sections["home.whyChooseUs"];
  const ourServices = sections["home.services"];
  const fob = sections["home.fobHighlight"];
  const accounts = sections["home.businessAccounts"];
  const request = sections["home.request"];
  const faq = sections["home.faq"];
  const area = sections["home.serviceArea"];

  return (
    <>
      {hero.visible ? (
        <section aria-labelledby="hero-heading" className="bg-brushed">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <h1 id="hero-heading" className="text-[2rem] font-extrabold md:text-5xl">
                {hero.content.heading}
              </h1>
              <p className="mt-5 text-xl md:text-[1.375rem]">
                <FilledText text={hero.content.text} values={values} />
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <CallButton phone={settings.phone} label={hero.content.callButton} />
                <ButtonLink href="#request" variant="secondary">
                  <ClipboardList aria-hidden="true" className="size-6 shrink-0" />
                  {hero.content.requestButton}
                </ButtonLink>
              </div>
              <p className="mt-8 text-lg">
                Call us any time, day or night:
                <br />
                <PhoneNumberLink phone={settings.phone} className="mt-1 text-3xl text-navy hover:text-action md:text-4xl" />
              </p>
            </div>
            <KeyIllustration className="hidden size-64 drop-shadow-xl lg:block" />
          </div>
        </section>
      ) : (
        <h1 className="sr-only">{settings.businessName}</h1>
      )}

      {emergency.visible && (
        <Section labelledBy="emergency-heading">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex max-w-3xl gap-5">
              <span className="hidden size-16 shrink-0 items-center justify-center rounded-full bg-silver-light text-navy sm:flex">
                <Siren aria-hidden="true" className="size-9" />
              </span>
              <div>
                <SectionHeading id="emergency-heading">{emergency.content.heading}</SectionHeading>
                <p className="mt-4">
                  <FilledText text={emergency.content.text} values={values} />
                </p>
              </div>
            </div>
            <CallButton phone={settings.phone} label={emergency.content.button} className="shrink-0" />
          </div>
        </Section>
      )}

      {business.visible && (
        <Section labelledBy="business-heading" tone="silver">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex max-w-3xl gap-5">
              <span className="hidden size-16 shrink-0 items-center justify-center rounded-full bg-white text-navy sm:flex">
                <Building2 aria-hidden="true" className="size-9" />
              </span>
              <div>
                <SectionHeading id="business-heading">{business.content.heading}</SectionHeading>
                <p className="mt-4">
                  <FilledText text={business.content.text} values={values} />
                </p>
              </div>
            </div>
            <ButtonLink href="#request" className="shrink-0">
              <ClipboardList aria-hidden="true" className="size-6 shrink-0" />
              {business.content.button}
            </ButtonLink>
          </div>
        </Section>
      )}

      {about.visible && (
        <Section labelledBy="about-heading">
          <div className="max-w-3xl">
            <SectionHeading id="about-heading">{about.content.heading}</SectionHeading>
            <Paragraphs text={about.content.text} values={values} className="mt-4" />
            <p className="mt-6">
              <ButtonLink href="/about" variant="secondary">
                More about us
              </ButtonLink>
            </p>
          </div>
        </Section>
      )}

      {why.visible && (
        <Section labelledBy="why-heading" tone="silver">
          <SectionHeading id="why-heading" className="text-center">
            {why.content.heading}
          </SectionHeading>
          <WhyChooseUsBadges badges={why.content.badges} />
        </Section>
      )}

      {ourServices.visible && services.length > 0 && (
        <Section labelledBy="services-heading">
          <div className="max-w-3xl">
            <SectionHeading id="services-heading">{ourServices.content.heading}</SectionHeading>
            <p className="mt-4">
              <FilledText text={ourServices.content.text} values={values} />
            </p>
          </div>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} phone={settings.phone} />
            ))}
          </ul>
          <p className="mt-10 text-center">
            <ButtonLink href="/services" variant="secondary">
              See all services in detail
            </ButtonLink>
          </p>
        </Section>
      )}

      {fob.visible && (
        <Section labelledBy="fob-heading" tone="brushed">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex max-w-3xl gap-5">
              <span className="hidden size-16 shrink-0 items-center justify-center rounded-full bg-white text-navy sm:flex">
                <Smartphone aria-hidden="true" className="size-9" />
              </span>
              <div>
                <SectionHeading id="fob-heading">{fob.content.heading}</SectionHeading>
                <p className="mt-4">
                  <FilledText text={fob.content.text} values={values} />
                </p>
              </div>
            </div>
            <CallButton phone={settings.phone} label={fob.content.button} className="shrink-0" />
          </div>
        </Section>
      )}

      {accounts.visible && (
        <Section labelledBy="accounts-heading" tone="navy">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <SectionHeading id="accounts-heading">{accounts.content.heading}</SectionHeading>
              <p className="mt-4">
                <FilledText text={accounts.content.text} values={values} tone="dark" />
              </p>
            </div>
            <CallButton phone={settings.phone} label={accounts.content.button} variant="light" className="shrink-0" />
          </div>
        </Section>
      )}

      {request.visible && (
        <Section id="request" labelledBy="request-heading">
          <div className="mx-auto max-w-3xl">
            <SectionHeading id="request-heading">{request.content.heading}</SectionHeading>
            <p className="mt-4 text-xl">
              <FilledText text={request.content.text} values={values} />
            </p>
            <RequestServiceForm
              services={services.map((service) => service.title)}
              buttonLabel={request.content.button}
              successMessage={request.content.successMessage}
              values={values}
            />
          </div>
        </Section>
      )}

      {faq.visible && faqs.length > 0 && (
        <Section labelledBy="faq-heading" tone="silver">
          <div className="mx-auto max-w-3xl">
            <SectionHeading id="faq-heading">{faq.content.heading}</SectionHeading>
            <FaqList faqs={faqs} className="mt-8" />
          </div>
        </Section>
      )}

      {area.visible && (
        <Section labelledBy="area-heading">
          <SectionHeading id="area-heading">{area.content.heading}</SectionHeading>
          <p className="mt-4 max-w-3xl">
            <FilledText text={area.content.text} values={values} />
          </p>
          <ul className="mt-8 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-4">
            {settings.towns.map((town) => (
              <li key={town} className="flex items-center gap-3 rounded-xl bg-silver-light px-4 py-3 font-bold text-navy">
                <MapPin aria-hidden="true" className="size-6 shrink-0 text-action" />
                {town}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
