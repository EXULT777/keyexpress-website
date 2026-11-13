"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { buttonClasses } from "@/components/site/buttons";
import { FieldError, inputBase } from "./form-parts";

// A list of short text entries (Towns, payment methods) with Add and Remove
// buttons. Each entry is sent as another value under the same field name.
export function ListEditor({
  name,
  label,
  hint,
  itemLabel,
  addLabel,
  initial,
  error,
}: {
  name: string;
  label: string;
  hint?: string;
  itemLabel: string;
  addLabel: string;
  initial: string[];
  error?: string;
}) {
  const nextId = useRef(initial.length);
  const [items, setItems] = useState(() => initial.map((value, id) => ({ id, value })));
  const [focusId, setFocusId] = useState<number | null>(null);
  const inputs = useRef(new Map<number, HTMLInputElement>());

  useEffect(() => {
    if (focusId !== null) inputs.current.get(focusId)?.focus();
  }, [focusId]);

  return (
    <fieldset>
      <legend className="text-lg font-bold text-navy">{label}</legend>
      {hint && <p className="mt-1 text-ink-soft">{hint}</p>}
      <ul className="mt-3 space-y-3">
        {items.map((item, index) => {
          const id = `${name}-${item.id}`;
          return (
            <li key={item.id} className="flex items-center gap-3">
              <label htmlFor={id} className="sr-only">
                {itemLabel} {index + 1}
              </label>
              <input
                id={id}
                name={name}
                value={item.value}
                ref={(element) => {
                  if (element) inputs.current.set(item.id, element);
                  else inputs.current.delete(item.id);
                }}
                onChange={(event) =>
                  setItems((current) =>
                    current.map((entry) => (entry.id === item.id ? { ...entry, value: event.target.value } : entry)),
                  )
                }
                className={inputBase}
              />
              <button
                type="button"
                onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
                className="inline-flex min-h-14 shrink-0 items-center gap-2 rounded-xl border-2 border-silver px-3 font-bold text-error hover:border-error"
              >
                <Trash2 aria-hidden="true" className="size-5" />
                Remove<span className="sr-only"> {item.value || `${itemLabel} ${index + 1}`}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => {
          const id = nextId.current++;
          setItems((current) => [...current, { id, value: "" }]);
          setFocusId(id);
        }}
        className={buttonClasses("secondary", "mt-4")}
      >
        <Plus aria-hidden="true" className="size-6" />
        {addLabel}
      </button>
      <FieldError id={`${name}-error`} error={error} />
    </fieldset>
  );
}
