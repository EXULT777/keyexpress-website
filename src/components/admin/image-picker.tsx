"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { CheckboxField, FieldError } from "./form-parts";

// An optional picture in an Admin form: the current one with a "Remove this
// picture" box, and a file chooser with a preview of the new one. Sends "image"
// and "removeImage", which the server reads with imageFromForm().
export function ImagePicker({
  id,
  legend,
  hint,
  currentUrl,
  accept,
  shape,
  error,
}: {
  id: string;
  legend: string;
  hint: string;
  currentUrl: string | null;
  accept: string;
  // The aspect-ratio class the picture is shown in, e.g. "aspect-[4/3]".
  shape: string;
  error?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const picture = cn(shape, "w-72 max-w-full rounded-xl border-2 object-cover");

  return (
    <fieldset>
      <legend className="text-lg font-bold text-navy">{legend}</legend>
      <p className="mt-1 text-ink-soft">{hint}</p>
      {currentUrl && (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentUrl} alt="The picture now" className={cn(picture, "border-silver")} />
          <div className="mt-3">
            <CheckboxField name="removeImage" label="Remove this picture" />
          </div>
        </div>
      )}
      <label htmlFor={id} className="mt-4 block font-bold text-navy">
        {currentUrl ? "Or choose a new picture" : "Choose a picture"}
      </label>
      <input
        id={id}
        name="image"
        type="file"
        accept={accept}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-error`}
        onChange={(event) => {
          const chosen = event.target.files?.[0];
          setPreview(chosen ? URL.createObjectURL(chosen) : null);
        }}
        className="mt-2 block w-full rounded-xl border-2 border-ink-soft bg-white p-3 text-lg file:mr-4 file:min-h-12 file:rounded-lg file:border-0 file:bg-silver-light file:px-4 file:font-bold file:text-navy"
      />
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="The new picture (not saved yet)" className={cn(picture, "mt-3 border-action")} />
      )}
      <FieldError id={`${id}-error`} error={error} />
    </fieldset>
  );
}
