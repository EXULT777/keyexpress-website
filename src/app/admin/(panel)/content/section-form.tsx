"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { CheckboxField, errorFor, FieldError, inputClasses, SaveRow, TextField } from "@/components/admin/form-parts";
import { IconSelect } from "@/components/admin/icon-select";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { buttonClasses } from "@/components/site/buttons";
import type { ActionResult } from "@/lib/action-result";
import type { SectionKey } from "@/lib/page-sections";

type FieldMeta = { name: string; label: string; kind: "line" | "text" | "badges" };
type Badge = { icon: string; title: string; text: string };

export function SectionForm({
  sectionKey,
  fields,
  content,
  hideable,
  visible,
  action,
}: {
  sectionKey: SectionKey;
  fields: FieldMeta[];
  content: Record<string, unknown>;
  hideable: boolean;
  visible: boolean;
  action: (previous: ActionResult, formData: FormData) => Promise<ActionResult>;
}) {
  const { state, onSubmit, pending } = useAdminForm(action);
  const prefix = sectionKey.replace(/\W/g, "-");

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {hideable && (
        <CheckboxField
          name="visible"
          label="Show this section on the home page"
          hint="Untick it to hide the section without losing its text."
          defaultChecked={visible}
        />
      )}
      {fields.map((field) =>
        field.kind === "badges" ? (
          <BadgesEditor key={field.name} prefix={prefix} initial={(content[field.name] as Badge[]) ?? []} state={state} />
        ) : (
          <TextField
            key={field.name}
            id={`${prefix}-${field.name}`}
            name={field.name}
            label={field.label}
            defaultValue={String(content[field.name] ?? "")}
            multiline={field.kind === "text"}
            rows={field.name === "text" && sectionKey === "about.intro" ? 10 : 4}
            error={errorFor(state, field.name)}
          />
        ),
      )}
      <SaveRow state={state} pending={pending} />
    </form>
  );
}

function BadgesEditor({ prefix, initial, state }: { prefix: string; initial: Badge[]; state: ActionResult }) {
  const nextId = useRef(initial.length);
  const [badges, setBadges] = useState(() => initial.map((badge, id) => ({ ...badge, id })));

  function move(index: number, by: -1 | 1) {
    setBadges((current) => {
      const copy = [...current];
      [copy[index], copy[index + by]] = [copy[index + by], copy[index]];
      return copy;
    });
  }

  return (
    <fieldset>
      <legend className="text-lg font-bold text-navy">Badges</legend>
      <ol className="mt-3 space-y-4">
        {badges.map((badge, index) => (
          <li key={badge.id} className="rounded-xl border-2 border-silver p-4">
            <p className="mb-3 font-bold text-navy">Badge {index + 1}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <IconSelect id={`${prefix}-badge-${badge.id}-icon`} name={`badges.${index}.icon`} label="Icon" defaultValue={badge.icon} />
              <div>
                <label htmlFor={`${prefix}-badge-${badge.id}-title`} className="block text-lg font-bold text-navy">
                  Title
                </label>
                <input
                  id={`${prefix}-badge-${badge.id}-title`}
                  name={`badges.${index}.title`}
                  defaultValue={badge.title}
                  aria-invalid={Boolean(errorFor(state, `badges.${index}.title`))}
                  className={inputClasses}
                />
                <FieldError id={`${prefix}-badge-${badge.id}-title-error`} error={errorFor(state, `badges.${index}.title`)} />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor={`${prefix}-badge-${badge.id}-text`} className="block text-lg font-bold text-navy">
                Short line
              </label>
              <input
                id={`${prefix}-badge-${badge.id}-text`}
                name={`badges.${index}.text`}
                defaultValue={badge.text}
                aria-invalid={Boolean(errorFor(state, `badges.${index}.text`))}
                className={inputClasses}
              />
              <FieldError id={`${prefix}-badge-${badge.id}-text-error`} error={errorFor(state, `badges.${index}.text`)} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className={buttonClasses("secondary", "disabled:opacity-40")}>
                <ArrowUp aria-hidden="true" className="size-5" /> Move up<span className="sr-only">: badge {index + 1}</span>
              </button>
              <button
                type="button"
                disabled={index === badges.length - 1}
                onClick={() => move(index, 1)}
                className={buttonClasses("secondary", "disabled:opacity-40")}
              >
                <ArrowDown aria-hidden="true" className="size-5" /> Move down<span className="sr-only">: badge {index + 1}</span>
              </button>
              <button
                type="button"
                onClick={() => setBadges((current) => current.filter((entry) => entry.id !== badge.id))}
                className="inline-flex min-h-14 items-center gap-2 rounded-xl border-2 border-silver px-4 font-bold text-error hover:border-error"
              >
                <Trash2 aria-hidden="true" className="size-5" /> Remove<span className="sr-only"> badge {index + 1}</span>
              </button>
            </div>
          </li>
        ))}
      </ol>
      {badges.length < 8 && (
        <button
          type="button"
          onClick={() => setBadges((current) => [...current, { id: nextId.current++, icon: "key", title: "", text: "" }])}
          className={buttonClasses("secondary", "mt-4")}
        >
          <Plus aria-hidden="true" className="size-6" /> Add a badge
        </button>
      )}
      <FieldError id={`${prefix}-badges-error`} error={errorFor(state, "badges")} />
    </fieldset>
  );
}
