"use client";

import { useState } from "react";
import { CheckboxField, errorFor, FieldError, SaveRow, TextField } from "@/components/admin/form-parts";
import { IconSelect } from "@/components/admin/icon-select";
import { useAdminForm } from "@/components/admin/use-admin-form";
import type { ActionResult } from "@/lib/action-result";

export type ServiceFormValues = {
  title: string;
  shortDescription: string;
  longDescription: string;
  icon: string;
  imageUrl: string | null;
  visible: boolean;
};

export function ServiceForm({
  values,
  action,
  isNew,
}: {
  values: ServiceFormValues;
  action: (previous: ActionResult, formData: FormData) => Promise<ActionResult>;
  isNew: boolean;
}) {
  const { state, onSubmit, pending } = useAdminForm(action);
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <TextField name="title" label="Title" defaultValue={values.title} error={errorFor(state, "title")} />
      <TextField
        name="shortDescription"
        label="Short description"
        hint="One or two sentences, shown on the service's card on the home page."
        multiline
        rows={3}
        defaultValue={values.shortDescription}
        error={errorFor(state, "shortDescription")}
      />
      <TextField
        name="longDescription"
        label="Longer description"
        hint="Shown on the Services page. Leave an empty line between paragraphs."
        multiline
        rows={10}
        defaultValue={values.longDescription}
        error={errorFor(state, "longDescription")}
      />
      <IconSelect id="service-icon" name="icon" label="Icon" defaultValue={values.icon} />

      <fieldset>
        <legend className="text-lg font-bold text-navy">Picture (optional)</legend>
        <p className="mt-1 text-ink-soft">Shown next to the description on the Services page. PNG, JPG, WebP or SVG, up to 2 MB.</p>
        {values.imageUrl && (
          <div className="mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={values.imageUrl} alt="The picture now" className="aspect-[4/3] w-60 rounded-xl border-2 border-silver object-cover" />
            <div className="mt-3">
              <CheckboxField name="removeImage" label="Remove this picture" />
            </div>
          </div>
        )}
        <label htmlFor="service-image" className="mt-4 block font-bold text-navy">
          {values.imageUrl ? "Or choose a new picture" : "Choose a picture"}
        </label>
        <input
          id="service-image"
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          aria-invalid={Boolean(errorFor(state, "image"))}
          aria-describedby="service-image-error"
          onChange={(event) => {
            const chosen = event.target.files?.[0];
            setPreview(chosen ? URL.createObjectURL(chosen) : null);
          }}
          className="mt-2 block w-full rounded-xl border-2 border-ink-soft bg-white p-3 text-lg file:mr-4 file:min-h-12 file:rounded-lg file:border-0 file:bg-silver-light file:px-4 file:font-bold file:text-navy"
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="The new picture (not saved yet)" className="mt-3 aspect-[4/3] w-60 rounded-xl border-2 border-action object-cover" />
        )}
        <FieldError id="service-image-error" error={errorFor(state, "image")} />
      </fieldset>

      <CheckboxField name="visible" label="Show this service on the website" defaultChecked={values.visible} />
      <SaveRow state={state} pending={pending} label={isNew ? "Add this service" : "Save changes"} />
    </form>
  );
}
