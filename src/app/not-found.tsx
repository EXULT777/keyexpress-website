import type { Metadata } from "next";
import { House } from "lucide-react";
import { ButtonLink, PhoneNumberLink } from "@/components/site/buttons";
import { FilledText } from "@/components/site/filled-text";
import { SiteChrome } from "@/components/site/site-chrome";
import { getPlaceholderValues, getSections, getSettings } from "@/server/site-data";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

export default async function NotFound() {
  const [settings, sections, values] = await Promise.all([getSettings(), getSections(), getPlaceholderValues()]);
  const content = sections["not-found"].content;

  return (
    <SiteChrome>
      <div className="bg-brushed">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 md:py-24">
          <h1 className="text-[2rem] font-extrabold md:text-5xl">{content.heading}</h1>
          <p className="mt-5 text-xl">
            <FilledText text={content.text} values={values} />
          </p>
          <div className="mt-8">
            <ButtonLink href="/" className="w-full sm:w-auto">
              <House aria-hidden="true" className="size-6 shrink-0" />
              {content.button}
            </ButtonLink>
          </div>
          <p className="mt-8">
            <PhoneNumberLink phone={settings.phone} className="text-3xl text-navy hover:text-action" />
          </p>
        </div>
      </div>
    </SiteChrome>
  );
}
