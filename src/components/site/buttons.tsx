import Link from "next/link";
import { Phone } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { telHref } from "@/lib/phone";

const base =
  "btn-motion inline-flex min-h-14 items-center justify-center rounded-xl py-3 text-center text-lg font-bold no-underline";

// Padding and gap live here rather than in `base`: cn() doesn't merge classes, so a
// px-2 passed in className would lose to px-6 instead of replacing it.
const sizes = {
  normal: "gap-3 px-6",
  // Two buttons side by side on a phone, like the sticky call bar.
  compact: "gap-2 px-2 min-[400px]:px-3",
};

// --glow is the soft light around a button on hover, --pulse the ring a call button sends out.
const variants = {
  // Calling on light backgrounds: the palette's blue into royal.
  call: "bg-linear-to-br from-action to-royal text-white shadow-[0_10px_28px_-10px_rgb(20_39_155/0.7)] hover:from-royal hover:to-royal",
  // Blue button for white and light backgrounds.
  primary: "bg-action text-white shadow-[0_8px_24px_-12px_rgb(61_86_178/0.8)] hover:bg-action-hover",
  secondary:
    "border-2 border-action bg-white text-action hover:bg-silver-soft hover:text-action-hover",
  // White button for the dark blue header and bands (calling there too).
  light: "bg-white text-royal shadow-[0_10px_28px_-10px_rgb(0_0_0/0.5)] hover:bg-silver-soft [--pulse:rgb(255_255_255/0.6)] [--pulse-end:rgb(255_255_255/0)] [--glow:rgb(159_177_245/0.55)]",
  // Outlined button for the dark blue header and bands.
  outlineLight: "border-2 border-white/60 text-white hover:border-white hover:bg-white/10 [--glow:rgb(159_177_245/0.55)]",
};

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClasses(variant: ButtonVariant = "primary", className?: string, size: ButtonSize = "normal") {
  return cn(base, sizes[size], variants[variant], className);
}

export function ButtonLink({
  href,
  variant = "primary",
  size,
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={buttonClasses(variant, className, size)}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={buttonClasses(variant, className, size)}>
      {children}
    </a>
  );
}

// `withNumber` shows "Call (555) 014-7823" in one button; `pulse` adds the ring.
export function CallButton({
  phone,
  label = "Call Now",
  variant = "call",
  size,
  className,
  withNumber = false,
  pulse = false,
}: {
  phone: string;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  withNumber?: boolean;
  pulse?: boolean;
}) {
  return (
    <a href={telHref(phone)} className={buttonClasses(variant, cn(pulse && "btn-pulse", "whitespace-nowrap", className), size)}>
      <Phone aria-hidden="true" className="size-6 shrink-0" strokeWidth={2.25} />
      {withNumber ? (
        <span>Call {phone}</span>
      ) : (
        <span>
          {label}
          <span className="sr-only"> at {phone}</span>
        </span>
      )}
    </a>
  );
}

// The phone number as large, tappable text.
// Bold, no underline, with a colored phone icon; the color changes on hover.
export function PhoneNumberLink({
  phone,
  className,
  tone = "light",
}: {
  phone: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  const colors =
    tone === "dark" ? { link: "text-white hover:text-sky", icon: "text-sky" } : { link: "text-navy hover:text-action-hover", icon: "text-action" };
  return (
    <a
      href={telHref(phone)}
      className={cn("inline-flex items-center gap-2 font-bold whitespace-nowrap transition-colors", colors.link, className)}
    >
      <Phone aria-hidden="true" className={cn("size-[1em] shrink-0", colors.icon)} strokeWidth={2.5} />
      {phone}
    </a>
  );
}
