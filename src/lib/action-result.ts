// What an Admin form's server action returns, so every form can show
// "Saved ✓" or the problems in the same way.
export type ActionResult =
  | { status: "idle" }
  | { status: "saved"; savedAt: number; message?: string }
  | { status: "invalid"; errors: Record<string, string> }
  | { status: "failed"; message: string };

export const IDLE: ActionResult = { status: "idle" };

export function saved(message?: string): ActionResult {
  return { status: "saved", savedAt: Date.now(), message };
}

export function invalid(errors: Record<string, string>): ActionResult {
  return { status: "invalid", errors };
}

// zod issues -> { "field.path": "message" }, first message per field.
export function errorsFromIssues(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "form";
    errors[key] ??= issue.message;
  }
  return errors;
}
