"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { buttonClasses } from "@/components/site/buttons";
import { IDLE, type ActionResult } from "@/lib/action-result";
import { ResultMessage } from "./form-parts";

export type ListItem = { id: number; title: string; visible: boolean };

const smallButton =
  "inline-flex min-h-14 items-center gap-2 rounded-xl border-2 border-silver bg-white px-3 font-bold text-navy hover:border-action hover:text-action disabled:opacity-40 disabled:hover:border-silver disabled:hover:text-navy";

// The Services and FAQ lists: edit, reorder, show or hide, and delete, with one
// message at the top saying what just happened.
export function SortableList({
  items,
  itemName,
  editHrefBase,
  move,
  setVisible,
  remove,
}: {
  items: ListItem[];
  itemName: string;
  // Each item's Edit link is `${editHrefBase}/${id}`.
  editHrefBase: string;
  move: (id: number, direction: "up" | "down") => Promise<ActionResult>;
  setVisible: (id: number, visible: boolean) => Promise<ActionResult>;
  remove: (id: number) => Promise<ActionResult>;
}) {
  const [state, run, pending] = useActionState(
    (_previous: ActionResult, change: () => Promise<ActionResult>) => change(),
    IDLE,
  );
  const [confirming, setConfirming] = useState<number | null>(null);
  const act = (change: () => Promise<ActionResult>) => startTransition(() => run(change));

  return (
    <div>
      <div className="mb-4 min-h-8">
        <ResultMessage state={state} />
      </div>
      {items.length === 0 && <p className="rounded-2xl border-2 border-silver bg-white p-6 text-lg">There are none yet.</p>}
      <ol className="space-y-4">
        {items.map((item, index) => (
          <li key={item.id} className="rounded-2xl border-2 border-silver bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl">
                <span className="mr-2 text-ink-soft">{index + 1}.</span>
                {item.title}
              </h2>
              <span
                className={
                  item.visible
                    ? "rounded-full bg-silver-light px-3 py-1 text-lg font-bold text-success"
                    : "rounded-full bg-silver-light px-3 py-1 text-lg font-bold text-error"
                }
              >
                {item.visible ? "Shown on the website" : "Hidden"}
              </span>
            </div>

            {confirming === item.id ? (
              <div role="alert" className="mt-4 rounded-xl border-4 border-error p-4">
                <p className="text-lg font-bold text-error">
                  Delete “{item.title}”? This can&apos;t be undone.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setConfirming(null);
                      act(() => remove(item.id));
                    }}
                    className="inline-flex min-h-14 items-center gap-2 rounded-xl bg-error px-5 text-lg font-bold text-white"
                  >
                    <Trash2 aria-hidden="true" className="size-5" /> Yes, delete it
                  </button>
                  <button type="button" onClick={() => setConfirming(null)} className={buttonClasses("secondary")}>
                    No, keep it
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`${editHrefBase}/${item.id}`} className={buttonClasses("primary", "px-4")}>
                  <Pencil aria-hidden="true" className="size-5" /> Edit<span className="sr-only"> {item.title}</span>
                </Link>
                <button type="button" disabled={pending || index === 0} onClick={() => act(() => move(item.id, "up"))} className={smallButton}>
                  <ArrowUp aria-hidden="true" className="size-5" /> Move up<span className="sr-only"> {item.title}</span>
                </button>
                <button
                  type="button"
                  disabled={pending || index === items.length - 1}
                  onClick={() => act(() => move(item.id, "down"))}
                  className={smallButton}
                >
                  <ArrowDown aria-hidden="true" className="size-5" /> Move down<span className="sr-only"> {item.title}</span>
                </button>
                <button type="button" disabled={pending} onClick={() => act(() => setVisible(item.id, !item.visible))} className={smallButton}>
                  {item.visible ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
                  {item.visible ? "Hide" : "Show"}
                  <span className="sr-only"> {item.title}</span>
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setConfirming(item.id)}
                  className={`${smallButton} text-error hover:border-error hover:text-error`}
                >
                  <Trash2 aria-hidden="true" className="size-5" /> Delete<span className="sr-only"> {item.title}</span>
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>
      <p className="sr-only" aria-live="polite">
        {pending ? `Saving the ${itemName} list…` : ""}
      </p>
    </div>
  );
}
