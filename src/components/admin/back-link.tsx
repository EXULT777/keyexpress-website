import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-6 inline-flex min-h-12 items-center gap-2 text-lg font-bold text-action underline">
      <ArrowLeft aria-hidden="true" className="size-5" />
      {label}
    </Link>
  );
}
