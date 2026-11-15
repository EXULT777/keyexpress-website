import { Banknote, CreditCard, Mail, Smartphone } from "lucide-react";
import { createElement } from "react";
import Link from "next/link";
import type { MenuLink } from "@/lib/navigation";
import { placeholderValues } from "@/lib/placeholders";
import type { BusinessSettings } from "@/server/content";
import { PhoneNumberLink } from "./buttons";
import { FilledText } from "./filled-text";
import { Logo } from "./logo";

function paymentIcon(method: string) {
  if (/cash/i.test(method)) return Banknote;
  if (/pay\b/i.test(method)) return Smartphone;
  return CreditCard;
}

export function SiteFooter({ settings, links }: { settings: BusinessSettings; links: MenuLink[] }) {
  return (
    <footer className="on-dark border-t border-white/10 bg-navy-deep text-white">
      <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-10 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-14 lg:grid-cols-[1.2fr_1.2fr_0.8fr_1fr]">
        <div className="space-y-4">
          {/* The default logo is made for dark blue; an uploaded one gets a white plate to stay readable. */}
          {settings.hasCustomLogo ? (
            <div className="inline-block rounded-xl bg-white px-4 py-3">
              <Logo src={settings.logoUrl} name={settings.businessName} />
            </div>
          ) : (
            <Logo src={settings.logoUrl} name={settings.businessName} size="large" />
          )}
          <p>
            <FilledText text={settings.footerText} placeholders={placeholderValues(settings)} tone="dark" />
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl">Contact Us</h2>
          <PhoneNumberLink phone={settings.phone} tone="dark" className="text-2xl" />
          <p>
            <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-2 break-all text-white underline">
              <Mail aria-hidden="true" className="size-5 shrink-0" />
              {settings.email}
            </a>
          </p>
          <p className="font-bold">Open 24/7 for emergencies</p>
          <p>Serving {settings.serviceAreaCity} and surrounding areas</p>
        </div>

        <nav aria-label="Footer" className="space-y-3">
          <h2 className="text-xl">Pages</h2>
          <ul className="grid grid-cols-2 gap-x-6 md:grid-cols-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-11 items-center text-white underline decoration-white/40 hover:decoration-sky">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3">
          <h2 className="text-xl">Payment We Accept</h2>
          <ul className="flex flex-wrap gap-2">
            {settings.paymentMethods.map((method) => (
              <li key={method} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                {createElement(paymentIcon(method), { "aria-hidden": true, className: "size-5 shrink-0 text-sky" })}
                {method}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/25">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-x-6 gap-y-1 px-4 py-6 text-silver-soft sm:px-6">
          <p>
            © {new Date().getFullYear()} {settings.businessName}. All rights reserved.
          </p>
          {settings.licenseNumber && <p>License #{settings.licenseNumber}</p>}
        </div>
      </div>
    </footer>
  );
}
