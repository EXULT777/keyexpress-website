"use client";

import { ClipboardList } from "lucide-react";
import { usePathname } from "next/navigation";
import { requestServiceHref } from "@/lib/navigation";
import { ButtonLink, CallButton } from "./buttons";

// Always on screen on phones and tablets, so calling is one tap away.
export function StickyCallBar({ phone }: { phone: string }) {
  const pathname = usePathname();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-silver bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(11,37,69,0.12)] lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-3">
        <CallButton phone={phone} className="px-3" />
        <ButtonLink href={requestServiceHref(pathname)} variant="secondary" className="px-3">
          <ClipboardList aria-hidden="true" className="size-6 shrink-0 max-[400px]:hidden" />
          Request Service
        </ButtonLink>
      </div>
    </div>
  );
}
