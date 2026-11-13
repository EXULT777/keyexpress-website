import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { StickyCallBar } from "@/components/site/sticky-call-bar";
import { getSettings } from "@/server/site-data";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-lg focus:font-bold focus:text-navy"
      >
        Skip to main content
      </a>
      <SiteHeader settings={settings} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      {/* Room below the footer so the sticky call bar never covers the end of the page. */}
      <div className="bg-navy pb-28 lg:pb-0">
        <SiteFooter settings={settings} />
      </div>
      <StickyCallBar phone={settings.phone} />
    </>
  );
}
