import { BriefcaseBusiness, Building2, ClipboardList, MapPin, Siren, Smartphone } from "lucide-react";
import { ButtonLink, CallButton, PhoneNumberLink } from "@/components/site/buttons";
import { FilledText, Paragraphs } from "@/components/site/filled-text";
import { Callout, FaqList, ServiceTiles, WhyChooseUsBadges } from "@/components/site/blocks";
import { LockIllustration } from "@/components/site/lock-illustration";
import { LockShowcase } from "@/components/site/lock-showcase";
import { LocalBusinessJsonLd } from "@/components/site/local-business-json-ld";
import { RequestServiceForm } from "@/components/site/request-form";
import { Section, SectionHeading } from "@/components/site/section";
import { EmergencyServiceBadge } from "@/components/site/site-chrome";
import { requestServiceHref } from "@/lib/navigation";
import { fillPlaceholders } from "@/lib/placeholders";
import { getPlaceholderValues, getSections, getSettings, getVisibleFaqs, getVisibleServices } from "@/server/site-data";
import { pageMetadata } from "@/server/page-metadata";

export function generateMetadata() {
  return pageMetadata("/");
}

export default async function HomePage() {
  const [settings, sections, services, faqs, placeholders] = await Promise.all([
    getSettings(),
    getSections(),
    getVisibleServices(),
    getVisibleFaqs(),
    getPlaceholderValues(),
  ]);
  const fill = (text: string) => fillPlaceholders(text, placeholders);
  const hero = sections["home.hero"];
  const emergency = sections["home.emergency"];
  const business = sections["home.business"];
  const about = sections["home.about"];
  const why = sections["home.whyChooseUs"];
  const ourServices = sections["home.services"];
  const fob = sections["home.fobHighlight"];
  const businessAccounts = sections["home.businessAccounts"];
  const request = sections["home.request"];
  const faq = sections["home.faq"];
  const area = sections["home.serviceArea"];
  // With the form section hidden, "Request Service" opens the Contact page's form.
  const requestHref = requestServiceHref("/", request.visible);

  return (
    <>
      <LocalBusinessJsonLd settings={settings} services={services} />
      {hero.visible ? (
        <section aria-labelledby="hero-heading" className="on-dark bg-night relative overflow-hidden text-white">
          {/* Phones: a big, faded padlock in the top-right corner, partly off the edge,
              behind the words. From 640px the padlock sits on the right, beside them. */}
          <div className="mx-auto grid max-w-6xl items-center gap-x-8 px-4 pt-10 pb-12 sm:grid-cols-[1fr_auto] sm:px-6 md:py-16 lg:gap-x-10 lg:py-20">
            <LockShowcase className="pointer-events-none absolute top-2 -right-14 w-[250px] opacity-30 sm:pointer-events-auto sm:static sm:order-last sm:w-44 sm:opacity-100 md:w-56 lg:w-80">
              <LockIllustration className="block h-auto w-full" />
            </LockShowcase>
            <div className="relative max-w-3xl">
              {settings.emergencyBadge && <EmergencyServiceBadge />}
              <h1 id="hero-heading" className="text-[2rem] font-extrabold md:text-[2.5rem] md:leading-[1.12] lg:text-5xl">
                {fill(hero.content.heading)}
              </h1>
              <p className="mt-4 text-lg text-silver-soft sm:text-xl md:mt-5 md:text-[1.375rem]">
                <FilledText text={hero.content.text} placeholders={placeholders} tone="dark" />
              </p>
              <div className="mt-7 grid gap-3 md:mt-8 md:flex md:gap-4">
                <CallButton phone={settings.phone} label={fill(hero.content.callButton)} variant="light" />
                <ButtonLink href={requestHref} variant="outlineLight">
                  <ClipboardList aria-hidden="true" className="size-6 shrink-0" />
                  {fill(hero.content.requestButton)}
                </ButtonLink>
              </div>
              <p className="mt-7 flex flex-col gap-1 border-t border-white/15 pt-6 text-lg text-silver-soft md:mt-8 md:border-0 md:pt-0">
                {fill(hero.content.phoneIntro)}
                <PhoneNumberLink phone={settings.phone} tone="dark" className="text-[1.75rem] min-[400px]:text-3xl md:text-4xl" />
              </p>
            </div>
          </div>
        </section>
      ) : (
        <h1 className="sr-only">{settings.businessName}</h1>
      )}

      {emergency.visible && (
        <Section labelledBy="emergency-heading">
          <Callout
            tone="alert"
            icon={<Siren aria-hidden="true" />}
            action={<CallButton phone={settings.phone} label={fill(emergency.content.button)} />}
          >
            <SectionHeading id="emergency-heading">{fill(emergency.content.heading)}</SectionHeading>
            <p className="mt-3 md:mt-4">
              <FilledText text={emergency.content.text} placeholders={placeholders} />
            </p>
          </Callout>
        </Section>
      )}

      {business.visible && (
        <Section labelledBy="business-heading" tone="silver">
          <Callout
            tone="card"
            icon={<Building2 aria-hidden="true" />}
            action={
              <ButtonLink href={requestHref}>
                <ClipboardList aria-hidden="true" className="size-6 shrink-0" />
                {fill(business.content.button)}
              </ButtonLink>
            }
          >
            <SectionHeading id="business-heading">{fill(business.content.heading)}</SectionHeading>
            <p className="mt-3 md:mt-4">
              <FilledText text={business.content.text} placeholders={placeholders} />
            </p>
          </Callout>
        </Section>
      )}

      {about.visible && (
        <Section labelledBy="about-heading">
          <div className="max-w-3xl">
            <SectionHeading id="about-heading">{fill(about.content.heading)}</SectionHeading>
            <Paragraphs text={about.content.text} placeholders={placeholders} className="mt-4" />
            <p className="mt-6">
              <ButtonLink href="/about" variant="secondary" className="w-full sm:w-auto">
                {fill(about.content.button)}
              </ButtonLink>
            </p>
          </div>
        </Section>
      )}

      {why.visible && (
        <Section labelledBy="why-heading" tone="silver">
          <SectionHeading id="why-heading" className="text-center">
            {fill(why.content.heading)}
          </SectionHeading>
          <WhyChooseUsBadges badges={why.content.badges} placeholders={placeholders} />
        </Section>
      )}

      {ourServices.visible && services.length > 0 && (
        <Section id="services" labelledBy="services-heading">
          <div className="max-w-3xl">
            <SectionHeading id="services-heading">{fill(ourServices.content.heading)}</SectionHeading>
            <p className="mt-4">
              <FilledText text={ourServices.content.text} placeholders={placeholders} />
            </p>
          </div>
          <ServiceTiles
            services={services}
            phone={settings.phone}
            callLabel={fill(ourServices.content.cardLink)}
            placeholders={placeholders}
          />
        </Section>
      )}

      {fob.visible && (
        <Section labelledBy="fob-heading" tone="silver">
          <Callout
            tone="highlight"
            icon={<Smartphone aria-hidden="true" />}
            action={<CallButton phone={settings.phone} label={fill(fob.content.button)} />}
          >
            <SectionHeading id="fob-heading">{fill(fob.content.heading)}</SectionHeading>
            <p className="mt-3 md:mt-4">
              <FilledText text={fob.content.text} placeholders={placeholders} />
            </p>
          </Callout>
        </Section>
      )}

      {businessAccounts.visible && (
        <Section labelledBy="business-accounts-heading" tone="navy">
          <Callout
            tone="dark"
            icon={<BriefcaseBusiness aria-hidden="true" />}
            action={<CallButton phone={settings.phone} label={fill(businessAccounts.content.button)} variant="light" />}
          >
            <SectionHeading id="business-accounts-heading">{fill(businessAccounts.content.heading)}</SectionHeading>
            <p className="mt-3 text-silver-soft md:mt-4">
              <FilledText text={businessAccounts.content.text} placeholders={placeholders} tone="dark" />
            </p>
          </Callout>
        </Section>
      )}

      {request.visible && (
        <Section id="request" labelledBy="request-heading">
          <div className="mx-auto max-w-3xl">
            <SectionHeading id="request-heading">{fill(request.content.heading)}</SectionHeading>
            <p className="mt-4 text-lg md:text-xl">
              <FilledText text={request.content.text} placeholders={placeholders} />
            </p>
            <RequestServiceForm
              services={services.map((service) => service.title)}
              buttonLabel={fill(request.content.button)}
              successMessage={request.content.successMessage}
              placeholders={placeholders}
            />
          </div>
        </Section>
      )}

      {faq.visible && faqs.length > 0 && (
        <Section id="faq" labelledBy="faq-heading" tone="silver">
          <div className="mx-auto max-w-3xl">
            <SectionHeading id="faq-heading">{fill(faq.content.heading)}</SectionHeading>
            <FaqList faqs={faqs} placeholders={placeholders} className="mt-8" />
          </div>
        </Section>
      )}

      {area.visible && (
        <Section labelledBy="area-heading">
          <SectionHeading id="area-heading">{fill(area.content.heading)}</SectionHeading>
          <p className="mt-4 max-w-3xl">
            <FilledText text={area.content.text} placeholders={placeholders} />
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {settings.towns.map((town) => (
              <li
                key={town}
                className="flex min-h-14 min-w-0 items-center gap-2 rounded-xl border border-silver bg-silver-soft px-3 py-2 leading-snug font-bold text-navy md:gap-3 md:px-4 md:py-3"
              >
                <MapPin aria-hidden="true" className="size-5 shrink-0 text-action md:size-6" />
                <span className="min-w-0 [overflow-wrap:anywhere]">{town}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
