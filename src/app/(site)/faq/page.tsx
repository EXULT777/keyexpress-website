import { FaqList } from "@/components/site/blocks";
import { CallButton } from "@/components/site/buttons";
import { FilledText } from "@/components/site/filled-text";
import { PageHeader } from "@/components/site/site-chrome";
import { pageMetadata } from "@/server/page-metadata";
import { getPlaceholderValues, getSections, getSettings, getVisibleFaqs } from "@/server/site-data";

export function generateMetadata() {
  return pageMetadata("/faq");
}

export default async function FaqPage() {
  const [settings, sections, faqs, values] = await Promise.all([
    getSettings(),
    getSections(),
    getVisibleFaqs(),
    getPlaceholderValues(),
  ]);
  const intro = sections["faq.intro"].content;

  return (
    <>
      <PageHeader title={intro.heading}>
        <p>
          <FilledText text={intro.text} values={values} />
        </p>
      </PageHeader>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
        <FaqList faqs={faqs} />
        <div className="mt-12 rounded-2xl bg-silver-light p-6 text-center">
          <p className="text-xl font-bold text-navy">Still have a question?</p>
          <p className="mt-2">Call us any time. We&apos;re happy to help.</p>
          <div className="mt-5">
            <CallButton phone={settings.phone} />
          </div>
        </div>
      </div>
    </>
  );
}
