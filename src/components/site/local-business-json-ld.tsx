import type { BusinessSettings, Service } from "@/server/content";
import { siteUrl } from "@/server/site-url";

// schema.org Locksmith data for search engines, built from Business Settings so
// it always matches what the page shows. A mobile business has no street
// address, so it lists the areas it serves instead.
export function LocalBusinessJsonLd({ settings, services }: { settings: BusinessSettings; services: Service[] }) {
  const base = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "Locksmith",
    name: settings.businessName,
    url: `${base}/`,
    logo: new URL(settings.logoUrl, base).href,
    image: new URL(settings.logoUrl, base).href,
    telephone: settings.phone,
    email: settings.email,
    description: settings.footerText,
    areaServed: [settings.serviceAreaCity, ...settings.towns].map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    paymentAccepted: settings.paymentMethods.join(", "),
    ...(settings.licenseNumber && {
      hasCredential: { "@type": "EducationalOccupationalCredential", name: `License #${settings.licenseNumber}` },
    }),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Locksmith services",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: service.title, description: service.shortDescription },
      })),
    },
  };
  return (
    <script
      type="application/ld+json"
      // "<" is escaped so text typed into the Admin can never close this script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
