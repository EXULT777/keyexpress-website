import type { Metadata } from "next";
import { ExternalLink, LogOut } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/server/admin-session";
import { db } from "@/server/db";
import { logOutAction } from "../actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  const newRequests = await db.serviceRequest.count({ where: { status: "NEW" } });

  return (
    <div className="min-h-screen bg-silver-light">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-lg focus:font-bold focus:text-navy"
      >
        Skip to main content
      </a>
      <header className="on-dark bg-navy text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-xl font-bold">Website Admin</p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl px-3 text-lg font-bold text-white underline"
            >
              View website
              <ExternalLink aria-hidden="true" className="size-5" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <form action={logOutAction}>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-4 text-lg font-bold text-navy hover:bg-silver-soft"
              >
                <LogOut aria-hidden="true" className="size-5" />
                Log out
              </button>
            </form>
          </div>
        </div>
        <p className="mx-auto max-w-7xl px-4 pb-3 text-silver-soft">Signed in as {admin.email}</p>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:py-8">
        <AdminNav newRequests={newRequests} />
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
