import type { MetadataRoute } from "next";
import { siteUrl } from "@/server/site-url";

// Built per request so it always uses this server's SITE_URL.
export const dynamic = "force-dynamic";

const pages = [
  { path: "/", priority: 1 },
  { path: "/services", priority: 0.9 },
  { path: "/contact", priority: 0.8 },
  { path: "/about", priority: 0.6 },
  { path: "/faq", priority: 0.6 },
  { path: "/privacy-policy", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return pages.map((page) => ({
    url: `${base}${page.path === "/" ? "" : page.path}`,
    changeFrequency: "monthly",
    priority: page.priority,
  }));
}
