import type { Metadata } from "next";
import { AdminCard } from "@/components/admin/form-parts";
import { AdminPageTitle } from "@/components/admin/page-title";
import { publicPages } from "@/lib/navigation";
import { requireAdmin } from "@/server/admin-session";
import { listPageSeo } from "@/server/content";
import { db } from "@/server/db";
import { savePageSeo } from "./actions";
import { SeoForm } from "./seo-form";

export const metadata: Metadata = { title: "Search & Sharing" };

export default async function SeoPage() {
  await requireAdmin();
  const seoByPath = new Map((await listPageSeo(db)).map((seo) => [seo.path, seo]));
  const pages = publicPages.flatMap((page) => {
    const seo = seoByPath.get(page.path);
    return seo ? [{ ...seo, name: page.adminName }] : [];
  });

  return (
    <>
      <AdminPageTitle title="Search & Sharing">
        <p>
          How each page appears in Google and when it&apos;s shared. You can write {"{phone}"}, {"{email}"} or{" "}
          {"{city}"} here too.
        </p>
      </AdminPageTitle>
      <div className="space-y-8">
        {pages.map((page) => (
          <AdminCard key={page.path} title={page.name}>
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
