"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { NavLinks } from "./nav-links";

// The phone-sized menu: a big button that says "Menu", opening a list of big links.
export function MobileMenu() {
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
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="shrink-0 lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpenOn(open ? null : pathname)}
        className="inline-flex min-h-14 items-center gap-2 rounded-xl border-2 border-navy px-3 text-lg font-bold text-navy hover:bg-silver-light sm:px-4"
      >
        {open ? <X aria-hidden="true" className="size-7" /> : <Menu aria-hidden="true" className="size-7" />}
        {open ? "Close" : "Menu"}
      </button>
      <nav
        id={panelId}
        aria-label="Main"
        hidden={!open}
        className="absolute inset-x-0 top-full z-30 border-b-4 border-silver bg-white shadow-lg"
      >
        <NavLinks
          className="mx-auto flex max-w-6xl flex-col px-4 py-2"
          linkClassName="flex min-h-14 items-center border-b border-silver-soft px-2 text-xl font-bold"
        />
      </nav>
    </div>
  );
}
