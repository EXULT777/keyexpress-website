import type { Metadata } from "next";
import { AdminCard } from "@/components/admin/form-parts";
import { AdminPageTitle } from "@/components/admin/page-title";
import { requireAdmin } from "@/server/admin-session";
import { listPageSeo } from "@/server/content";
import { db } from "@/server/db";
import { savePageSeo } from "./actions";
import { SeoForm } from "./seo-form";

export const metadata: Metadata = { title: "Search & Sharing" };

const pageNames: Record<string, string> = {
  "/": "Home page",
  "/services": "Services page",
  "/about": "About page",
  "/faq": "Questions (FAQ) page",
  "/contact": "Contact page",
  "/privacy-policy": "Privacy Policy page",
};

const order = Object.keys(pageNames);

export default async function SeoPage() {
  await requireAdmin();
  const pages = (await listPageSeo(db)).sort((a, b) => order.indexOf(a.path) - order.indexOf(b.path));

  return (
    <>
      <AdminPageTitle title="Search & Sharing">
        <p>
          How each page appears in Google and when it&apos;s shared. You can write {"{city}"} or {"{phone}"} here too.
        </p>
      </AdminPageTitle>
      <div className="space-y-8">
        {pages.map((page) => (
          <AdminCard key={page.path} title={pageNames[page.path] ?? page.path}>
            <SeoForm
              idPrefix={`seo${page.path.replace(/\W/g, "-")}`}
              title={page.title}
              description={page.description}
              imageUrl={page.ogImageUrl}
              action={savePageSeo.bind(null, page.path)}
            />
          </AdminCard>
        ))}
      </div>
    </>
  );
}
