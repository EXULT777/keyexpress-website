import Link from "next/link";
import { cn } from "@/lib/cn";
import type { MenuLink } from "@/lib/navigation";
import type { BusinessSettings } from "@/server/content";
import { CallButton, PhoneNumberLink } from "./buttons";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { StickyHeader } from "./sticky-header";

export function SiteHeader({ settings, menu }: { settings: BusinessSettings; menu: MenuLink[] }) {
  return (
    <>
      {/* Below 1024px the phone number lives up here (the spec keeps it in the header);
          from 1024px it's in the Call button, so the strip only stays for a license number. */}
      <div className={cn("on-dark border-b border-white/10 bg-navy-deep text-white", !settings.licenseNumber && "lg:hidden")}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6">
          <p className="flex items-center gap-2 text-lg lg:hidden">
            <span className="hidden font-bold text-sky min-[400px]:inline">Open 24/7</span>
            <PhoneNumberLink phone={settings.phone} tone="dark" className="text-xl" />
          </p>
          {settings.licenseNumber && <p className="text-lg">License #{settings.licenseNumber}</p>}
        </div>
      </div>
      {/* The main bar comes down the page with the visitor. */}
      <StickyHeader>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* The default logo is made for dark blue, so it sits on the header as is. An
              uploaded logo gets a white plate to stay readable. On narrow phones the
              logo shrinks so the Menu button always fits. */}
          {settings.hasCustomLogo ? (
            <Link href="/" className="header-logo min-w-0 rounded-xl bg-white px-3 py-2 lg:shrink-0">
              <Logo src={settings.logoUrl} name={`${settings.businessName} home page`} className="max-w-[240px]" />
            </Link>
          ) : (
            <Link href="/" className="header-logo min-w-0 rounded-lg lg:shrink-0">
              <Logo src={settings.logoUrl} name={`${settings.businessName} home page`} size="large" />
            </Link>
          )}
          <nav aria-label="Main" className="hidden lg:block">
            <NavLinks
              links={menu}
              tone="dark"
              className="flex items-center gap-1"
              linkClassName="block rounded-lg px-3 py-2 text-lg font-bold"
            />
          </nav>
          <div className="hidden lg:block">
            <CallButton phone={settings.phone} variant="light" withNumber pulse />
          </div>
          <MobileMenu links={menu} phone={settings.phone} />
        </div>
      </StickyHeader>
    </>
  );
}
