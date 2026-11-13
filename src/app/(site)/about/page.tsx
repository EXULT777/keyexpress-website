import { WhyChooseUsBadges } from "@/components/site/blocks";
import { CallButton } from "@/components/site/buttons";
import { Paragraphs } from "@/components/site/filled-text";
import { PageHeader } from "@/components/site/site-chrome";
import { Section, SectionHeading } from "@/components/site/section";
import { pageMetadata } from "@/server/page-metadata";
import { getPlaceholderValues, getSections, getSettings } from "@/server/site-data";

export function generateMetadata() {
  return pageMetadata("/about");
}

export default async function AboutPage() {
  const [settings, sections, values] = await Promise.all([getSettings(), getSections(), getPlaceholderValues()]);
  const about = sections["about.intro"].content;
  const why = sections["home.whyChooseUs"].content;

  return (
    <>
      <PageHeader title={about.heading} />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <div className="max-w-3xl space-y-5">
          <Paragraphs text={about.text} values={values} />
        </div>
        <div className="mt-8">
          <CallButton phone={settings.phone} />
        </div>
      </div>
      <Section labelledBy="why-heading" tone="silver">
        <SectionHeading id="why-heading" className="text-center">
          {why.heading}
        </SectionHeading>
        <WhyChooseUsBadges badges={why.badges} />
      </Section>
    </>
  );
}
