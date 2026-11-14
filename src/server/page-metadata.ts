import "server-only";
import type { Metadata } from "next";
import { fillPlaceholders } from "@/lib/placeholders";
import { getAllPageSeo, getPlaceholderValues, getSettings } from "./site-data";

// The default social preview image (src/app/og-image/route.tsx), used when the
// Admin hasn't uploaded one for the page.
export const DEFAULT_OG_IMAGE = "/og-image";

// Title, description and social preview for a page, from the Admin's SEO section.
export async function pageMetadata(path: string): Promise<Metadata> {
  const [allSeo, placeholders, settings] = await Promise.all([getAllPageSeo(), getPlaceholderValues(), getSettings()]);
  const seo = allSeo.find((entry) => entry.path === path);
  const title = fillPlaceholders(seo?.title ?? settings.businessName, placeholders);
  const description = seo ? fillPlaceholders(seo.description, placeholders) : undefined;
  const image = seo?.ogImageUrl
    ? { url: seo.ogImageUrl, alt: title }
    : { url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: settings.businessName };

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: settings.businessName,
      title,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}
