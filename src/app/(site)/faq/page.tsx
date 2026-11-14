import { FaqList } from "@/components/site/blocks";
import { CallButton } from "@/components/site/buttons";
import { FilledText } from "@/components/site/filled-text";
import { PageHeader } from "@/components/site/site-chrome";
import { fillPlaceholders } from "@/lib/placeholders";
import { pageMetadata } from "@/server/page-metadata";
import { getPlaceholderValues, getSections, getSettings, getVisibleFaqs } from "@/server/site-data";

export function generateMetadata() {
  return pageMetadata("/faq");
}

export default async function FaqPage() {
  const [settings, sections, faqs, placeholders] = await Promise.all([
    getSettings(),
    getSections(),
    getVisibleFaqs(),
    getPlaceholderValues(),
  ]);
  const intro = sections["faq.intro"].content;

  return (
    <>
      <PageHeader title={fillPlaceholders(intro.heading, placeholders)}>
        <p>
          <FilledText text={intro.text} placeholders={placeholders} />
        </p>
      </PageHeader>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
        <FaqList faqs={faqs} placeholders={placeholders} />
        <div className="mt-12 rounded-2xl bg-silver-light p-6 text-center">
          <p className="text-xl font-bold text-navy">{fillPlaceholders(intro.closingHeading, placeholders)}</p>
          <p className="mt-2">
            <FilledText text={intro.closingText} placeholders={placeholders} />
          </p>
          <div className="mt-5">
            <CallButton phone={settings.phone} />
          </div>
        </div>
      </div>
    </>
  );
}
