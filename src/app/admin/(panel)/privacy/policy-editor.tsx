"use client";

import { useEffect, useState } from "react";
import { errorFor, FieldError, inputClasses, SaveRow } from "@/components/admin/form-parts";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { previewPolicy, savePolicy } from "./actions";

export function PolicyEditor({ markdown, initialPreview }: { markdown: string; initialPreview: string }) {
  const { state, onSubmit, pending } = useAdminForm(savePolicy);
  const [text, setText] = useState(markdown);
  const [preview, setPreview] = useState(initialPreview);

  // Refresh the preview shortly after typing stops.
  useEffect(() => {
    if (text === markdown) return;
    let current = true;
    const timer = setTimeout(async () => {
      const html = await previewPolicy(text);
      if (current) setPreview(html);
    }, 400);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [text, markdown]);

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="grid gap-8 xl:grid-cols-2">
        <div>
          <label htmlFor="policy-markdown" className="block text-lg font-bold text-navy">
            Policy text
          </label>
          <div id="policy-help" className="mt-1 text-ink-soft">
            <p>
              Start a line with <strong>## </strong> for a heading and <strong>- </strong> for a bullet point. Put words
              between <strong>**two stars**</strong> to make them bold. {"{phone}"} and {"{email}"} fill in your details.
            </p>
          </div>
          <textarea
            id="policy-markdown"
            name="markdown"
            rows={28}
            value={text}
            onChange={(event) => setText(event.target.value)}
            aria-describedby="policy-help policy-error"
            aria-invalid={Boolean(errorFor(state, "markdown"))}
            className={`${inputClasses} font-mono leading-relaxed`}
          />
          <FieldError id="policy-error" error={errorFor(state, "markdown")} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-navy">Preview</h2>
          <p className="mt-1 text-ink-soft">How the page will look. It updates as you type.</p>
          <div
            className="policy mt-2 max-h-[52rem] overflow-y-auto rounded-xl border-2 border-silver bg-white p-5"
            // previewPolicy returns HTML cleaned by renderMarkdown (src/server/markdown.ts).
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>
      </div>
      <div className="mt-8">
        <SaveRow state={state} pending={pending} />
      </div>
    </form>
  );
}
