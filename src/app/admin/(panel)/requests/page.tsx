import type { Metadata } from "next";
import { Download } from "lucide-react";
import Link from "next/link";
import { AdminPageTitle } from "@/components/admin/page-title";
import { buttonClasses } from "@/components/site/buttons";
import { cn } from "@/lib/cn";
import { isRequestStatus, requestStatuses, statusLabels, type RequestStatus } from "@/lib/service-request";
import { requireAdmin } from "@/server/admin-session";
import { db } from "@/server/db";
import { listServiceRequests } from "@/server/service-requests";
import { Inbox } from "./inbox";

export const metadata: Metadata = { title: "Service Requests" };

export default async function RequestsPage({ searchParams }: PageProps<"/admin/requests">) {
  await requireAdmin();
  const show = String((await searchParams).show ?? "").toUpperCase();
  const filter: RequestStatus | null = isRequestStatus(show) ? show : null;
  const all = await listServiceRequests(db);
  const shown = filter ? all.filter((request) => request.status === filter) : all;
  const counts = Object.fromEntries(requestStatuses.map((status) => [status, all.filter((r) => r.status === status).length]));

  const tabs = [
    { href: "/admin/requests", label: `All (${all.length})`, current: filter === null },
    ...requestStatuses.map((status) => ({
      href: `/admin/requests?show=${status.toLowerCase()}`,
      label: `${statusLabels[status]} (${counts[status]})`,
      current: filter === status,
    })),
  ];

  return (
    <>
      <AdminPageTitle title="Service Requests">
        <p>Requests sent through the website&apos;s form, newest first. Emergencies are marked in red.</p>
      </AdminPageTitle>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Show requests">
          <ul className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={tab.current ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-14 items-center rounded-xl border-2 px-4 text-lg font-bold",
                    tab.current ? "border-action bg-action text-white" : "border-silver bg-white text-navy hover:border-action",
                  )}
                >
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* A file download, so a plain link rather than client-side navigation. */}
        <a href="/admin/requests/export" className={buttonClasses("secondary")}>
          <Download aria-hidden="true" className="size-6" />
          Download all as a spreadsheet (CSV)
        </a>
      </div>

      <Inbox
        requests={shown.map(({ createdAt, ...request }) => ({ ...request, receivedAt: createdAt.toISOString() }))}
      />
    </>
  );
}
