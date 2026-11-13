import type { Metadata } from "next";
import { AdminCard } from "@/components/admin/form-parts";
import { AdminPageTitle } from "@/components/admin/page-title";
import { requireAdmin } from "@/server/admin-session";
import { getBusinessSettings, getPrivacyPolicy } from "@/server/content";
import { db } from "@/server/db";
import { renderMarkdown } from "@/server/markdown";
import { PolicyEditor } from "./policy-editor";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyAdminPage() {
  await requireAdmin();
  const [policy, settings] = await Promise.all([getPrivacyPolicy(db), getBusinessSettings(db)]);
  const lastUpdated = policy.lastUpdated.toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" });

  return (
    <>
      <AdminPageTitle title="Privacy Policy">
        <p>
          Last updated: <strong>{lastUpdated}</strong>. Saving changes moves this date to today. Before the website
          goes live, have the policy checked against your state&apos;s privacy laws.
        </p>
      </AdminPageTitle>
      <AdminCard>
        <PolicyEditor
          markdown={policy.markdown}
          initialPreview={renderMarkdown(policy.markdown, {
            phone: settings.phone,
            email: settings.email,
            city: settings.serviceAreaCity,
          })}
        />
      </AdminCard>
    </>
  );
}
