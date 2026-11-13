import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  white: "bg-white",
  silver: "bg-silver-light",
  brushed: "bg-brushed",
  navy: "on-dark bg-navy text-white",
};

export function Section({
  id,
  labelledBy,
  tone = "white",
  className,
  children,
}: {
  id?: string;
  labelledBy: string;
  tone?: keyof typeof tones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("scroll-mt-4 py-14 md:py-20", tones[tone], className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function SectionHeading({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <h2 id={id} className={cn("text-[1.75rem] md:text-4xl", className)}>
      {children}
    </h2>
  );
}
