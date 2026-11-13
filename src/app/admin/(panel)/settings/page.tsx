import type { Metadata } from "next";
import { AdminPageTitle } from "@/components/admin/page-title";
import { requireAdmin } from "@/server/admin-session";
import { getBusinessSettings } from "@/server/content";
import { db } from "@/server/db";
import { LogoForm, SettingsForm } from "./settings-forms";

export const metadata: Metadata = { title: "Business Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getBusinessSettings(db);
  return (
    <>
      <AdminPageTitle title="Business Settings">
        <p>The phone number, email and other details shown all over the website. Change them here once and every page updates.</p>
      </AdminPageTitle>
      <div className="space-y-8">
        <LogoForm logoUrl={settings.logoUrl} hasCustomLogo={settings.hasCustomLogo} businessName={settings.businessName} />
        <SettingsForm settings={settings} />
      </div>
    </>
  );
}
