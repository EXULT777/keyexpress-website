"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { MenuLink } from "@/lib/navigation";

const tones = {
  // On the dark blue header bar.
  dark: { current: "text-white underline decoration-sky decoration-[3px]", other: "text-white hover:text-sky" },
  // In the white drop-down menu on phones.
  light: { current: "text-action underline decoration-[3px]", other: "text-navy hover:bg-silver-soft hover:text-action" },
};

export function NavLinks({
  links,
  tone,
  onNavigate,
  trailingIcon,
  className,
  linkClassName,
}: {
  links: MenuLink[];
  tone: keyof typeof tones;
  onNavigate?: () => void;
  // Shown after each label, e.g. an arrow in the phone menu.
  trailingIcon?: ReactNode;
  className?: string;
  linkClassName?: string;
}) {
  const pathname = usePathname();
  return (
    <ul className={className}>
      {links.map((item) => {
        // Links to a spot on the home page ("/#faq") never count as the current page.
        const current = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={(event) => {
                onNavigate?.();
                // On the home page, scroll to the section ourselves: a second click on
                // FAQ (address already /#faq) would otherwise do nothing.
                const target = pathname === "/" && item.href.startsWith("/#") && document.getElementById(item.href.slice(2));
                if (!target) return;
                event.preventDefault();
                target.scrollIntoView();
                window.history.pushState(null, "", item.href);
              }}
              aria-current={current ? "page" : undefined}
              className={cn(linkClassName, current ? tones[tone].current : tones[tone].other)}
            >
              {item.label}
              {trailingIcon}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
