"use client";

import {
  Building2,
  CircleHelp,
  FileText,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Menu,
  Search,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/requests", label: "Service Requests", Icon: Inbox },
  { href: "/admin/settings", label: "Business Settings", Icon: Building2 },
  { href: "/admin/content", label: "Page Content", Icon: FileText },
  { href: "/admin/services", label: "Services", Icon: Wrench },
  { href: "/admin/faq", label: "Questions (FAQ)", Icon: CircleHelp },
  { href: "/admin/privacy", label: "Privacy Policy", Icon: ShieldCheck },
  { href: "/admin/seo", label: "Search & Sharing", Icon: Search },
  { href: "/admin/password", label: "Change Password", Icon: KeyRound },
];

export function AdminNav({ newRequests }: { newRequests: number }) {
  const pathname = usePathname();
  // Closed again after moving to another page, like the website's menu.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const listId = useId();

  return (
    <nav aria-label="Admin" className="lg:w-80 lg:shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpenOn(open ? null : pathname)}
        className="mb-4 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-navy bg-white px-4 text-lg font-bold text-navy lg:hidden"
      >
        {open ? <X aria-hidden="true" className="size-7" /> : <Menu aria-hidden="true" className="size-7" />}
        {open ? "Close menu" : "Admin menu"}
      </button>
      <ul id={listId} className={cn("space-y-2 lg:block", open ? "block" : "hidden")}>
        {items.map(({ href, label, Icon }) => {
          const current = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 text-lg font-bold",
                  current
                    ? "border-action bg-action text-white"
                    : "border-silver bg-white text-navy hover:border-action hover:text-action",
                )}
              >
                <Icon aria-hidden="true" className="size-6 shrink-0" />
                <span className="flex-1">{label}</span>
                {href === "/admin/requests" && newRequests > 0 && (
                  <span className="rounded-full bg-emergency px-2.5 py-0.5 text-base text-white">
                    {newRequests} new
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
