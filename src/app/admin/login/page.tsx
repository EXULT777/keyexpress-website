import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/site/logo";
import { currentAdmin } from "@/server/admin-session";
import { db } from "@/server/db";
import { getSettings } from "@/server/site-data";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await currentAdmin()) redirect("/admin");
  const [settings, adminCount] = await Promise.all([getSettings(), db.admin.count()]);

  return (
    <main id="main" className="flex min-h-screen items-start justify-center bg-silver-light px-4 py-12 md:items-center">
      <div className="w-full max-w-lg rounded-2xl border-2 border-silver bg-white p-6 md:p-10">
        {/* The default logo is silver and blue for dark backgrounds, so it gets a navy plate here. */}
        <div className={settings.hasCustomLogo ? "" : "inline-block rounded-xl bg-navy px-4 py-3"}>
          <Logo src={settings.logoUrl} name={settings.businessName} />
        </div>
        <h1 className="mt-8 text-[2rem] font-extrabold">Admin login</h1>
        {adminCount === 0 ? (
          <div role="alert" className="mt-6 rounded-xl border-4 border-error p-5">
            <p className="text-xl font-bold text-error">No Admin login has been set up yet.</p>
            <p className="mt-2">
              Set <code className="font-bold">ADMIN_EMAIL</code> and <code className="font-bold">ADMIN_PASSWORD</code> in
              the hosting&apos;s environment variables, then restart the website. See DEPLOY.md.
            </p>
          </div>
        ) : (
          <LoginForm />
        )}
        <p className="mt-8 text-ink-soft">
          Forgot your password? The person who set up the website can reset it (see “Forgot the Admin password” in
          DEPLOY.md).
        </p>
      </div>
    </main>
  );
}
