"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { IDLE, type ActionResult } from "@/lib/action-result";

// Runs an Admin form's server action without React's automatic form reset, so
// what the Admin typed stays on screen after saving, and after a problem too.
export function useAdminForm(action: (previous: ActionResult, formData: FormData) => Promise<ActionResult>) {
  const [state, dispatch, pending] = useActionState(action, IDLE);
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }
  return { state, onSubmit, pending };
}
