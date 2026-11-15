"use client";

import { LogIn } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { inputClasses } from "@/components/admin/form-parts";
import { buttonClasses } from "@/components/site/buttons";
import { logInAction, type LoginState } from "../actions";

const messages = {
  wrong: "That username and password don't match. Please try again.",
  "too-many": "Too many tries. For your security, please wait 15 minutes and try again.",
  missing: "Please enter both your username and your password.",
};

export function LoginForm() {
  const [state, action, pending] = useActionState(logInAction, { status: "idle" } as LoginState);
  const alertRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (state.status !== "idle") alertRef.current?.focus();
  }, [state]);

  return (
    <form action={action} className="mt-6 space-y-6">
      {state.status !== "idle" && (
        <p
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          className="rounded-xl border-4 border-error p-4 text-lg font-bold text-error outline-none"
        >
          {messages[state.status]}
        </p>
      )}
      <div>
        <label htmlFor="login-email" className="block text-lg font-bold text-navy">
          Username or email
        </label>
        {/* Plain text, so the login can be a name like "Admin" as well as an email. */}
        <input
          id="login-email"
          name="email"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          defaultValue={state.status === "idle" ? "" : state.email}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-lg font-bold text-navy">
          Password
        </label>
        <input id="login-password" name="password" type="password" autoComplete="current-password" className={inputClasses} />
      </div>
      <button type="submit" disabled={pending} className={buttonClasses("primary", "w-full disabled:opacity-70")}>
        <LogIn aria-hidden="true" className="size-6 shrink-0" />
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
