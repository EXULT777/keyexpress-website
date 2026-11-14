import { Banknote, CreditCard, Mail, Smartphone } from "lucide-react";
import { createElement } from "react";
import Link from "next/link";
import { footerLinks } from "@/lib/navigation";
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

export function SiteFooter({ settings }: { settings: BusinessSettings }) {
  return (
    <footer className="on-dark bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          {/* A white plate keeps any uploaded logo readable on dark blue. */}
          <div className="inline-block rounded-xl bg-white px-4 py-3">
            <Logo src={settings.logoUrl} name={settings.businessName} />
          </div>
          <p>
            <FilledText text={settings.footerText} placeholders={placeholderValues(settings)} tone="dark" />
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl">Contact Us</h2>
          <PhoneNumberLink phone={settings.phone} className="text-2xl text-white underline" />
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
          <ul className="space-y-1">
            {footerLinks.map((link) => (
              <li key={link.path}>
                <Link href={link.path} className="inline-flex min-h-11 items-center text-white underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3">
          <h2 className="text-xl">Payment We Accept</h2>
          <ul className="space-y-2">
            {settings.paymentMethods.map((method) => (
              <li key={method} className="flex items-center gap-3">
                {createElement(paymentIcon(method), { "aria-hidden": true, className: "size-6 shrink-0" })}
                {method}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/25">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-6 sm:px-6">
          <p>
            © {new Date().getFullYear()} {settings.businessName}. All rights reserved.
          </p>
          {settings.licenseNumber && <p>License #{settings.licenseNumber}</p>}
        </div>
      </div>
    </footer>
  );
}
