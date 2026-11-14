import type { ReactNode } from "react";
import { getSections, getSettings } from "@/server/site-data";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { StickyCallBar } from "./sticky-call-bar";

// Everything around a public page's content. Used by the public pages' layout
// and by the "page not found" page, which sits outside that layout.
export async function SiteChrome({ children }: { children: ReactNode }) {
  const [settings, sections] = await Promise.all([getSettings(), getSections()]);
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
      <StickyCallBar phone={settings.phone} homeHasRequestForm={sections["home.request"].visible} />
    </>
  );
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="bg-brushed">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <h1 className="text-[2rem] font-extrabold md:text-5xl">{title}</h1>
        {children && <div className="mt-4 max-w-3xl text-xl">{children}</div>}
      </div>
    </div>
  );
}
