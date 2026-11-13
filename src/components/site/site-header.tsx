import Link from "next/link";
import type { BusinessSettings } from "@/server/content";
import { CallButton, PhoneNumberLink } from "./buttons";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

export function EmergencyBadge() {
  return (
    <p className="inline-flex items-center rounded-full bg-emergency px-3 py-1 text-lg font-bold text-white">
      24/7 Emergency Service
    </p>
  );
}

export function SiteHeader({ settings }: { settings: BusinessSettings }) {
  return (
    <header>
      <div className="on-dark bg-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {settings.emergencyBadge && <EmergencyBadge />}
            {settings.licenseNumber && <p className="text-lg">License #{settings.licenseNumber}</p>}
          </div>
          {/* On large screens the number is in the bar below. */}
          <PhoneNumberLink phone={settings.phone} className="text-xl text-white underline lg:hidden" />
        </div>
      </div>
      <div className="relative border-b-2 border-silver bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* On narrow phones the logo shrinks so the Menu button always fits. */}
          <Link href="/" className="min-w-0 flex-1 lg:flex-none">
            <Logo src={settings.logoUrl} name={`${settings.businessName} home page`} className="max-w-[280px]" />
          </Link>
          <nav aria-label="Main" className="hidden lg:block">
            <NavLinks className="flex items-center gap-1" linkClassName="block rounded-lg px-3 py-2 text-lg font-bold" />
          </nav>
          <div className="hidden items-center gap-4 lg:flex">
            <PhoneNumberLink phone={settings.phone} className="hidden text-2xl text-navy hover:text-action xl:inline-flex" />
            <CallButton phone={settings.phone} />
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
