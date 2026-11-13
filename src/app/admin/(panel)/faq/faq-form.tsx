"use client";

import { CheckboxField, errorFor, SaveRow, TextField } from "@/components/admin/form-parts";
import { useAdminForm } from "@/components/admin/use-admin-form";
import type { ActionResult } from "@/lib/action-result";

export function FaqForm({
  values,
  action,
  isNew,
}: {
  values: { question: string; answer: string; visible: boolean };
  action: (previous: ActionResult, formData: FormData) => Promise<ActionResult>;
  isNew: boolean;
}) {
  const { state, onSubmit, pending } = useAdminForm(action);
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <TextField name="question" label="Question" defaultValue={values.question} error={errorFor(state, "question")} />
      <TextField name="answer" label="Answer" multiline rows={6} defaultValue={values.answer} error={errorFor(state, "answer")} />
      <CheckboxField name="visible" label="Show this question on the website" defaultChecked={values.visible} />
      <SaveRow state={state} pending={pending} label={isNew ? "Add this question" : "Save changes"} />
    </form>
  );
}
