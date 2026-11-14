import Link from "next/link";
import type { BusinessSettings } from "@/server/content";
import { CallButton, PhoneNumberLink } from "./buttons";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

// The red "24/7 Emergency Service" advert (Business Settings can turn it off).
export function EmergencyServiceBadge() {
  return (
    <p className="inline-flex items-center rounded-full bg-emergency px-3 py-1 text-lg font-bold text-white">
      24/7 Emergency Service
    </p>
  );
}

export function SiteHeader({ settings }: { settings: BusinessSettings }) {
  return (
    <header className="on-dark relative bg-navy text-white">
      <div className="border-b border-white/20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {settings.emergencyBadge && <EmergencyServiceBadge />}
            {settings.licenseNumber && <p className="text-lg">License #{settings.licenseNumber}</p>}
          </div>
          {/* Up to 1279px the big number lives up here; from 1280px it sits beside the menu. */}
          <div className="xl:hidden">
            <PhoneNumberLink phone={settings.phone} className="text-xl text-white underline lg:text-2xl" />
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* A white plate keeps any uploaded logo readable on dark blue. On narrow
            phones the logo shrinks so the Menu button always fits. */}
        <Link href="/" className="min-w-0 rounded-xl bg-white px-3 py-2 lg:shrink-0">
          <Logo src={settings.logoUrl} name={`${settings.businessName} home page`} className="max-w-[240px]" />
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks
            tone="dark"
            className="flex items-center gap-1"
            linkClassName="block rounded-lg px-3 py-2 text-lg font-bold"
          />
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          <div className="hidden xl:block">
            <PhoneNumberLink phone={settings.phone} className="text-2xl text-white underline" />
          </div>
          <CallButton phone={settings.phone} variant="light" />
        </div>
        <MobileMenu />
      </div>
    </header>
  );
}
