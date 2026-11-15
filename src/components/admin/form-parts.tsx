"use client";

import { CircleAlert, CircleCheck, Save } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { buttonClasses } from "@/components/site/buttons";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/cn";

export const inputBase =
  "block min-h-14 w-full rounded-xl border-2 border-ink-soft bg-white px-4 py-3 text-lg text-ink aria-[invalid=true]:border-error";

export const inputClasses = `mt-2 ${inputBase}`;

export function TextField({
  id: givenId,
  name,
  label,
  hint,
  defaultValue,
  error,
  type = "text",
  autoComplete,
  multiline,
  rows = 4,
}: {
  // Needed when the same field name appears in more than one form on a page.
  id?: string;
  name: string;
  label: string;
  hint?: ReactNode;
  defaultValue?: string;
  error?: string;
  type?: "text" | "email" | "tel" | "password";
  autoComplete?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const id = givenId ?? `field-${name}`;
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  const shared = {
    id,
    name,
    defaultValue,
    className: inputClasses,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy,
  };
  return (
    <div>
      <label htmlFor={id} className="block text-lg font-bold text-navy">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-ink-soft">
          {hint}
        </p>
      )}
      {multiline ? <textarea {...shared} rows={rows} /> : <input {...shared} type={type} autoComplete={autoComplete} />}
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-2 font-bold text-error">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-6 shrink-0" />
      {error}
    </p>
  );
}

export function CheckboxField({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="rounded-xl bg-silver-light p-4">
      <label className="flex cursor-pointer items-center gap-4 text-lg font-bold text-navy">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-7 shrink-0 accent-action" />
        {label}
      </label>
      {hint && <p className="mt-1 pl-11 text-ink-soft">{hint}</p>}
    </div>
  );
}

// The big Save button, with "Saved ✓" or the problems next to it.
export function SaveRow({
  state,
  pending,
  label = "Save changes",
}: {
  state: ActionResult;
  pending: boolean;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-t-2 border-silver-soft pt-6 sm:flex-row sm:items-center">
      <button type="submit" disabled={pending} className={buttonClasses("primary", "disabled:opacity-70")}>
        <Save aria-hidden="true" className="size-6 shrink-0" />
        {pending ? "Saving…" : label}
      </button>
      <ResultMessage state={state} />
    </div>
  );
}

export function ResultMessage({ state }: { state: ActionResult }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (state.status === "invalid" || state.status === "failed") ref.current?.focus();
  }, [state]);

  if (state.status === "saved") {
    return (
      <p role="status" className="flex items-center gap-2 text-xl font-bold text-success">
        <CircleCheck aria-hidden="true" className="size-7 shrink-0" />
        {state.message ?? "Saved ✓"}
      </p>
    );
  }
  if (state.status === "invalid" || state.status === "failed") {
    const count = state.status === "invalid" ? Object.keys(state.errors).length : 0;
    return (
      <p ref={ref} tabIndex={-1} role="alert" className="flex items-start gap-2 text-lg font-bold text-error outline-none">
        <CircleAlert aria-hidden="true" className="mt-0.5 size-6 shrink-0" />
        {state.status === "failed"
          ? state.message
          : count === 1
            ? "Not saved yet: please fix the item marked in red."
            : "Not saved yet: please fix the items marked in red."}
      </p>
    );
  }
  return <span role="status" />;
}

export function AdminCard({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border-2 border-silver bg-white p-5 md:p-8", className)}>
      {title && <h2 className="mb-6 text-2xl">{title}</h2>}
      {children}
    </section>
  );
}

export function errorFor(state: ActionResult, name: string) {
  return state.status === "invalid" ? state.errors[name] : undefined;
}
