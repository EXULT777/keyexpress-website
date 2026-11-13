import type { ReactNode } from "react";

export function AdminPageTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="text-[2rem] font-extrabold md:text-4xl">{title}</h1>
      {children && <div className="mt-3 max-w-3xl text-lg text-ink-soft">{children}</div>}
    </div>
  );
}
