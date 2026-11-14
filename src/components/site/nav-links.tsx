"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { mainNav } from "@/lib/navigation";

const tones = {
  // On the dark blue header bar.
  dark: { current: "text-white underline decoration-[3px]", other: "text-white hover:underline" },
  // In the white drop-down menu on phones.
  light: { current: "text-action underline decoration-[3px]", other: "text-navy hover:text-action hover:underline" },
};

export function NavLinks({
  tone,
  className,
  linkClassName,
}: {
  tone: keyof typeof tones;
  className?: string;
  linkClassName?: string;
}) {
  const pathname = usePathname();
  return (
    <ul className={className}>
      {mainNav.map((item) => {
        const current = pathname === item.path;
        return (
          <li key={item.path}>
            <Link
              href={item.path}
              aria-current={current ? "page" : undefined}
              className={cn(linkClassName, current ? tones[tone].current : tones[tone].other)}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
