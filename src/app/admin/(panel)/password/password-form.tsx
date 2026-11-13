"use client";

import { errorFor, SaveRow, TextField } from "@/components/admin/form-parts";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { changePassword } from "./actions";

export function PasswordForm() {
  const { state, onSubmit, pending } = useAdminForm(changePassword);
  return (
    // A fresh form after a change, so the passwords don't stay on screen.
    <form key={state.status === "saved" ? state.savedAt : "form"} onSubmit={onSubmit} noValidate className="space-y-6">
      <TextField name="current" label="Current password" type="password" autoComplete="current-password" error={errorFor(state, "current")} />
      <TextField
        name="next"
        label="New password"
        hint="At least 10 characters. A short sentence you'll remember, like “blue truck parks on Elm”, works well."
        type="password"
        autoComplete="new-password"
        error={errorFor(state, "next")}
      />
      <TextField name="confirm" label="New password again" type="password" autoComplete="new-password" error={errorFor(state, "confirm")} />
      <SaveRow state={state} pending={pending} label="Change password" />
    </form>
  );
}
