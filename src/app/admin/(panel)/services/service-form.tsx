"use client";

import { CheckboxField, errorFor, SaveRow, TextField } from "@/components/admin/form-parts";
import { IconSelect } from "@/components/admin/icon-select";
import { ImagePicker } from "@/components/admin/image-picker";
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
        hint="Saved for later: the website doesn't show it right now. Leave an empty line between paragraphs."
        multiline
        rows={10}
        defaultValue={values.longDescription}
        error={errorFor(state, "longDescription")}
      />
      <IconSelect id="service-icon" name="icon" label="Icon" defaultValue={values.icon} />

      <ImagePicker
        id="service-image"
        legend="Picture (optional)"
        hint="Saved for later: the website doesn't show it right now. PNG, JPG, WebP or SVG, up to 2 MB."
        currentUrl={values.imageUrl}
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        shape="aspect-[4/3]"
        error={errorFor(state, "image")}
      />

      <CheckboxField name="visible" label="Show this service on the website" defaultChecked={values.visible} />
      <SaveRow state={state} pending={pending} label={isNew ? "Add this service" : "Save changes"} />
    </form>
  );
}
