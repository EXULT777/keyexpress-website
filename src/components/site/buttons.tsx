import Link from "next/link";
import { Phone } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { telHref } from "@/lib/phone";

const base =
  "inline-flex min-h-14 items-center justify-center gap-3 rounded-xl px-6 py-3 text-center text-lg font-bold no-underline transition-colors";

const variants = {
  // Blue button for white and silver backgrounds.
  primary: "bg-action text-white hover:bg-action-hover",
  secondary: "border-2 border-action bg-white text-action hover:bg-silver-light hover:text-action-hover",
  // White button for dark blue backgrounds.
  light: "bg-white text-navy hover:bg-silver-soft",
};

export type ButtonVariant = keyof typeof variants;

export function buttonClasses(variant: ButtonVariant = "primary", className?: string) {
  return cn(base, variants[variant], className);
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={buttonClasses(variant, className)}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={buttonClasses(variant, className)}>
      {children}
    </a>
  );
}

export function CallButton({
  phone,
  label = "Call Now",
  variant = "primary",
  className,
}: {
  phone: string;
  label?: string;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <a href={telHref(phone)} className={buttonClasses(variant, className)}>
      <Phone aria-hidden="true" className="size-6 shrink-0" strokeWidth={2.25} />
      <span>
        {label}
        <span className="sr-only"> at {phone}</span>
      </span>
    </a>
  );
}

// The phone number as large, tappable text.
export function PhoneNumberLink({ phone, className }: { phone: string; className?: string }) {
  return (
    <a href={telHref(phone)} className={cn("inline-flex items-center gap-2 font-bold whitespace-nowrap", className)}>
      <Phone aria-hidden="true" className="size-[1em] shrink-0" strokeWidth={2.5} />
      {phone}
    </a>
  );
}
