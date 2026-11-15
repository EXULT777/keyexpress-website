import { Siren } from "lucide-react";
import type { ReactNode } from "react";
import { footerLinks, visibleMenuLinks } from "@/lib/navigation";
import { getSections, getSettings, getVisibleFaqs, getVisibleServices } from "@/server/site-data";
import { SiteFooter } from "./site-footer";
import { ScrollTopOnBack } from "./scroll-top-on-back";
import { SiteHeader } from "./site-header";
import { StickyCallBar } from "./sticky-call-bar";

// Everything around a public page's content. Used by the public pages' layout
// and by the "page not found" page, which sits outside that layout.
export async function SiteChrome({ children }: { children: ReactNode }) {
  const [settings, sections, services, faqs] = await Promise.all([
    getSettings(),
    getSections(),
    getVisibleServices(),
    getVisibleFaqs(),
  ]);
  // The same checks the home page uses to show these sections.
  const menu = visibleMenuLinks({
    services: sections["home.services"].visible && services.length > 0,
    faq: sections["home.faq"].visible && faqs.length > 0,
  });
  return (
    <div className="site-titles">
      <ScrollTopOnBack />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-lg focus:font-bold focus:text-navy"
      >
        Skip to main content
      </a>
      <SiteHeader settings={settings} menu={menu} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      {/* Room below the footer so the sticky call bar never covers the end of the page. */}
      <div className="bg-navy-deep pb-28 lg:pb-0">
        <SiteFooter settings={settings} links={footerLinks(menu)} />
      </div>
      <StickyCallBar phone={settings.phone} homeHasRequestForm={sections["home.request"].visible} />
    </div>
  );
}

// The red "24/7 Emergency Service" advert above each page's main heading
// (Business Settings can turn it off).
export function EmergencyServiceBadge() {
  return (
    <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-emergency px-4 py-1.5 text-lg font-bold text-white shadow-[0_8px_20px_-8px_rgb(198_40_40/0.7)]">
      <Siren aria-hidden="true" className="size-5 shrink-0" />
      24/7 Emergency Service
    </p>
  );
}

export async function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  const settings = await getSettings();
  return (
    <div className="on-dark bg-night text-white">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-12 sm:px-6 md:py-16">
        {settings.emergencyBadge && <EmergencyServiceBadge />}
        <h1 className="text-[2rem] font-extrabold md:text-5xl">{title}</h1>
        {children && <div className="mt-3 max-w-3xl text-lg text-silver-soft sm:text-xl md:mt-4">{children}</div>}
      </div>
    </div>
  );
}
