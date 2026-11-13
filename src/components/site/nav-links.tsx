"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { mainNav } from "@/lib/navigation";

export function NavLinks({ className, linkClassName }: { className?: string; linkClassName?: string }) {
  const pathname = usePathname();
  return (
    <ul className={className}>
      {mainNav.map((item) => {
        const current = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={cn(
                linkClassName,
                current ? "text-action underline decoration-[3px]" : "text-navy hover:text-action hover:underline",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
