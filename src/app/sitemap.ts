import type { MetadataRoute } from "next";
import { publicPages } from "@/lib/navigation";
import { siteUrl } from "@/server/site-url";

// Built per request so it always uses this server's SITE_URL.
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return publicPages.map((page) => ({
    url: `${base}${page.path === "/" ? "" : page.path}`,
    changeFrequency: "monthly",
    priority: page.sitemapPriority,
  }));
}
