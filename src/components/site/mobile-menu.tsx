"use client";

import { ChevronRight, Clock, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { MenuLink } from "@/lib/navigation";
import { PhoneNumberLink } from "./buttons";
import { NavLinks } from "./nav-links";

// The phone-sized menu: a big button that says "Menu", opening a panel of big links
// over a dimmed page. A tap on the dimmed page or Escape closes it, and the page
// behind doesn't scroll while it's open.
export function MobileMenu({ links, phone }: { links: MenuLink[]; phone: string }) {
  const pathname = usePathname();
  // The menu belongs to the page it was opened on, so moving to another page closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenOn(null);
      buttonRef.current?.focus();
    };
    // The menu only shows below 1024px, so turning a tablet to landscape closes it.
    const wide = window.matchMedia("(min-width: 1024px)");
    const onResize = () => wide.matches && setOpenOn(null);
    const root = document.documentElement;
    const overflowBefore = root.style.overflow;
    root.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    wide.addEventListener("change", onResize);
    return () => {
      root.style.overflow = overflowBefore;
      document.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <div className="shrink-0 lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpenOn(open ? null : pathname)}
        className="inline-flex min-h-14 items-center gap-2 rounded-xl border-2 border-white/80 px-3 text-lg font-bold text-white transition-colors hover:bg-white/10 aria-expanded:border-white aria-expanded:bg-white aria-expanded:text-navy sm:px-4"
      >
        {open ? <X aria-hidden="true" className="size-7" /> : <Menu aria-hidden="true" className="size-7" />}
        {open ? "Close" : "Menu"}
      </button>
      {open && (
        // The dimmed page under the panel. Mouse and touch only: keyboard users close with Escape or the button.
        <div aria-hidden="true" onClick={() => setOpenOn(null)} className="menu-backdrop absolute inset-x-0 top-full h-dvh bg-navy-deep/60" />
      )}
      <nav
        id={panelId}
        aria-label="Main"
        hidden={!open}
        // A white panel inside the dark header, so it uses the light-background focus outline.
        className="menu-panel on-light absolute inset-x-0 top-full z-10 max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-b-3xl bg-white shadow-[0_24px_48px_-16px_rgb(8_16_64/0.5)]"
      >
        {/* Services and FAQ scroll within the home page, which doesn't change the page, so a tap closes the menu itself. */}
        <NavLinks
          links={links}
          onNavigate={() => setOpenOn(null)}
          tone="light"
          trailingIcon={<ChevronRight aria-hidden="true" className="size-6 shrink-0 text-action" />}
          className="mx-auto flex max-w-6xl flex-col px-4 pt-2 sm:px-6"
          linkClassName="flex min-h-16 items-center justify-between gap-4 border-b border-silver-soft px-2 text-xl font-bold"
        />
        <div className="mx-auto max-w-6xl px-4 pt-5 pb-6 sm:px-6">
          <p className="flex items-center gap-2 px-2 font-bold text-ink-soft">
            <Clock aria-hidden="true" className="size-5 shrink-0" />
            Open 24/7 for emergencies
          </p>
          <PhoneNumberLink phone={phone} className="mt-1 px-2 text-[1.75rem]" />
        </div>
      </nav>
    </div>
  );
}
