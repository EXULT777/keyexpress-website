"use client";

import { ClipboardList } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { requestServiceHref } from "@/lib/navigation";
import { ButtonLink, CallButton } from "./buttons";

// Fields that bring up the on-screen keyboard. Checkboxes and buttons don't.
const TYPING_FIELDS = "input:not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]), textarea, select";

// Always on screen on phones and tablets, so calling is one tap away. It steps aside
// while the visitor fills in a form field, where it would cover the field above the
// on-screen keyboard, and comes back as soon as they leave the field.
export function StickyCallBar({ phone, homeHasRequestForm }: { phone: string; homeHasRequestForm: boolean }) {
  const pathname = usePathname();
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const onFocusIn = (event: FocusEvent) => setTyping(event.target instanceof Element && event.target.matches(TYPING_FIELDS));
    const onFocusOut = (event: FocusEvent) =>
      setTyping(event.relatedTarget instanceof Element && event.relatedTarget.matches(TYPING_FIELDS));
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return (
    <div
      data-typing={typing ? "" : undefined}
      className="call-bar fixed inset-x-0 bottom-0 z-40 border-t border-silver bg-white/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-6px_rgb(20_39_155/0.18)] backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-2 min-[400px]:gap-3">
        <CallButton phone={phone} pulse size="compact" />
        <ButtonLink
          href={requestServiceHref(pathname, homeHasRequestForm)}
          variant="secondary"
          size="compact"
          className="whitespace-nowrap max-[379px]:text-base"
        >
          <ClipboardList aria-hidden="true" className="size-6 shrink-0 max-[419px]:hidden" />
          Request Service
        </ButtonLink>
      </div>
    </div>
  );
}
