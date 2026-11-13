"use client";

import { useState } from "react";
import { CheckboxField, errorFor, FieldError, SaveRow, TextField } from "@/components/admin/form-parts";
import { useAdminForm } from "@/components/admin/use-admin-form";
import type { ActionResult } from "@/lib/action-result";

export function SeoForm({
  idPrefix,
  title,
  description,
  imageUrl,
  action,
}: {
  idPrefix: string;
  title: string;
  description: string;
  imageUrl: string | null;
  action: (previous: ActionResult, formData: FormData) => Promise<ActionResult>;
}) {
  const { state, onSubmit, pending } = useAdminForm(action);
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <TextField
        id={`${idPrefix}-title`}
        name="title"
        label="Page title"
        hint="Shown on the browser tab and as the blue headline in Google. Around 50 to 60 characters works best."
        defaultValue={title}
        error={errorFor(state, "title")}
      />
      <TextField
        id={`${idPrefix}-description`}
        name="description"
        label="Description"
        hint="The short summary under the headline in Google. Around 150 to 160 characters works best."
        multiline
        rows={3}
        defaultValue={description}
        error={errorFor(state, "description")}
      />
      <fieldset>
        <legend className="text-lg font-bold text-navy">Picture for sharing (optional)</legend>
        <p className="mt-1 text-ink-soft">
          Shown when someone shares this page on Facebook or in a text message. 1200 × 630 pixels works best. Without
          one, a picture with your name and phone number is used.
        </p>
        {imageUrl && (
          <div className="mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="The sharing picture now" className="aspect-[1200/630] w-72 rounded-xl border-2 border-silver object-cover" />
            <div className="mt-3">
              <CheckboxField name="removeImage" label="Remove this picture" />
            </div>
          </div>
        )}
        <label htmlFor={`${idPrefix}-image`} className="mt-4 block font-bold text-navy">
          {imageUrl ? "Or choose a new picture" : "Choose a picture"}
        </label>
        <input
          id={`${idPrefix}-image`}
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-invalid={Boolean(errorFor(state, "image"))}
          aria-describedby={`${idPrefix}-image-error`}
          onChange={(event) => {
            const chosen = event.target.files?.[0];
            setPreview(chosen ? URL.createObjectURL(chosen) : null);
          }}
          className="mt-2 block w-full rounded-xl border-2 border-ink-soft bg-white p-3 text-lg file:mr-4 file:min-h-12 file:rounded-lg file:border-0 file:bg-silver-light file:px-4 file:font-bold file:text-navy"
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="The new picture (not saved yet)" className="mt-3 aspect-[1200/630] w-72 rounded-xl border-2 border-action object-cover" />
        )}
        <FieldError id={`${idPrefix}-image-error`} error={errorFor(state, "image")} />
      </fieldset>
      <SaveRow state={state} pending={pending} />
    </form>
  );
}
