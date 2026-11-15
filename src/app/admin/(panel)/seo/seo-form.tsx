"use client";

import { errorFor, SaveRow, TextField } from "@/components/admin/form-parts";
import { ImagePicker } from "@/components/admin/image-picker";
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
      <ImagePicker
        id={`${idPrefix}-image`}
        legend="Picture for sharing (optional)"
        hint="Shown when someone shares this page on Facebook or in a text message. 1200 × 630 pixels works best. Without one, a picture with your name and phone number is used."
        currentUrl={imageUrl}
        accept="image/png,image/jpeg,image/webp"
        shape="aspect-[1200/630]"
        error={errorFor(state, "image")}
      />
      <SaveRow state={state} pending={pending} />
    </form>
  );
}
