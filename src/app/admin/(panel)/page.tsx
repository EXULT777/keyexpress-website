import type { Metadata } from "next";
import { Building2, CircleHelp, FileText, Inbox, Siren, Wrench } from "lucide-react";
import Link from "next/link";
import { AdminPageTitle } from "@/components/admin/page-title";
import { requireAdmin } from "@/server/admin-session";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Dashboard" };

const shortcuts = [
  { href: "/admin/requests", label: "See service requests", Icon: Inbox },
  { href: "/admin/settings", label: "Change phone, email or logo", Icon: Building2 },
  { href: "/admin/content", label: "Change the text on the website", Icon: FileText },
  { href: "/admin/services", label: "Add or change services", Icon: Wrench },
  { href: "/admin/faq", label: "Add or change questions", Icon: CircleHelp },
];

export default async function DashboardPage() {
  await requireAdmin();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60_000);
  const [newCount, emergencyCount, weekCount] = await Promise.all([
    db.serviceRequest.count({ where: { status: "NEW" } }),
    db.serviceRequest.count({ where: { status: "NEW", emergency: true } }),
    db.serviceRequest.count({ where: { createdAt: { gte: weekAgo } } }),
  ]);

  return (
    <>
      <AdminPageTitle title="Dashboard">
        <p>Welcome! Choose what you&apos;d like to do, or use the menu.</p>
      </AdminPageTitle>

      <ul className="grid gap-4 sm:grid-cols-3">
        <li className="rounded-2xl border-2 border-silver bg-white p-6">
          <p className="text-5xl font-extrabold text-navy">{newCount}</p>
          <p className="mt-2 text-lg font-bold">New service requests</p>
        </li>
        <li
          className={
            emergencyCount > 0
              ? "rounded-2xl border-4 border-emergency bg-white p-6"
              : "rounded-2xl border-2 border-silver bg-white p-6"
          }
        >
          <p className={emergencyCount > 0 ? "text-5xl font-extrabold text-emergency" : "text-5xl font-extrabold text-navy"}>
            {emergencyCount}
          </p>
          <p className="mt-2 flex items-center gap-2 text-lg font-bold">
            {emergencyCount > 0 && <Siren aria-hidden="true" className="size-6 text-emergency" />}
            New emergencies
          </p>
        </li>
        <li className="rounded-2xl border-2 border-silver bg-white p-6">
          <p className="text-5xl font-extrabold text-navy">{weekCount}</p>
          <p className="mt-2 text-lg font-bold">Requests in the last 7 days</p>
        </li>
      </ul>

      <h2 className="mt-12 text-2xl">Quick links</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {shortcuts.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex min-h-20 items-center gap-4 rounded-2xl border-2 border-silver bg-white px-6 py-4 text-xl font-bold text-navy hover:border-action hover:text-action"
            >
              <Icon aria-hidden="true" className="size-8 shrink-0 text-action" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
