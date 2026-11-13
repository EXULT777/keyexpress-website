import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/page-title";
import { pageSections, sectionKeys, type SectionKey } from "@/lib/page-sections";
import { requireAdmin } from "@/server/admin-session";
import { getPageSections } from "@/server/content";
import { db } from "@/server/db";
import { savePageSection } from "./actions";
import { SectionForm } from "./section-form";

export const metadata: Metadata = { title: "Page Content" };

const groups: { title: string; keys: SectionKey[] }[] = [
  { title: "Home page, from top to bottom", keys: sectionKeys.filter((key) => pageSections[key].page === "home") },
  { title: "Other pages", keys: sectionKeys.filter((key) => pageSections[key].page !== "home") },
];

export default async function ContentPage() {
  await requireAdmin();
  const sections = await getPageSections(db);

  return (
    <>
      <AdminPageTitle title="Page Content">
        <p>Open a section to change its text, then press Save. The website updates right away.</p>
        <p className="mt-2">
          Tip: write <strong>{"{phone}"}</strong>, <strong>{"{email}"}</strong> or <strong>{"{city}"}</strong> and the
          website fills in the details from Business Settings. Phone numbers become tap-to-call links.
        </p>
      </AdminPageTitle>
      {groups.map((group) => (
        <section key={group.title} aria-labelledby={`group-${group.keys[0]}`} className="mb-12">
          <h2 id={`group-${group.keys[0]}`} className="mb-4 text-2xl">
            {group.title}
          </h2>
          <div className="space-y-4">
            {group.keys.map((key) => {
              const definition = pageSections[key];
              const section = sections[key];
              const hideable = definition.page === "home";
              return (
                <details key={key} className="group rounded-2xl border-2 border-silver bg-white">
                  <summary className="flex min-h-16 items-center justify-between gap-4 rounded-2xl px-5 py-4 text-xl font-bold text-navy hover:bg-silver-light">
                    <span>{definition.title}</span>
                    <span className="flex items-center gap-3">
                      {hideable && (
                        <span
                          className={
                            section.visible
                              ? "rounded-full bg-silver-light px-3 py-1 text-lg text-success"
                              : "rounded-full bg-silver-light px-3 py-1 text-lg text-error"
                          }
                        >
                          {section.visible ? "Shown" : "Hidden"}
                        </span>
                      )}
                      <ChevronDown aria-hidden="true" className="size-7 transition-transform group-open:rotate-180" />
                    </span>
                  </summary>
                  <div className="border-t-2 border-silver-soft p-5 md:p-8">
                    <SectionForm
                      sectionKey={key}
                      fields={Object.entries(definition.fields).map(([name, field]) => ({ name, ...field }))}
                      content={section.content as Record<string, unknown>}
                      hideable={hideable}
                      visible={section.visible}
                      action={savePageSection.bind(null, key)}
                    />
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
