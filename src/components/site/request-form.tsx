"use client";

import { CircleAlert, CircleCheck, Send } from "lucide-react";
import { useActionState, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { sendServiceRequest, type FormValues, type RequestFormState } from "@/app/(site)/actions";
import { cn } from "@/lib/cn";
import type { PlaceholderValues } from "@/lib/placeholders";
import { HONEYPOT_FIELD, NOT_SURE, type RequestErrors, type RequestField } from "@/lib/service-request";
import { buttonClasses, CallButton } from "./buttons";
import { FilledText } from "./filled-text";

const labels: Record<RequestField, string> = {
  fullName: "Full name",
  phone: "Phone number",
  email: "Email (optional)",
  service: "Service needed",
  address: "Address or area",
  message: "Message (optional)",
};

const fieldOrder: RequestField[] = ["fullName", "phone", "email", "service", "address", "message"];

const inputClasses =
  "mt-2 block min-h-14 w-full rounded-xl border-2 border-ink-soft bg-white px-4 py-3 text-lg text-ink transition-[border-color,box-shadow] focus:border-action focus:shadow-[0_0_0_4px_rgb(92_122_234/0.2)] aria-[invalid=true]:border-error";

export function RequestServiceForm({
  services,
  buttonLabel,
  successMessage,
  placeholders,
}: {
  services: string[];
  buttonLabel: string;
  successMessage: string;
  placeholders: PlaceholderValues;
}) {
  const [state, formAction, pending] = useActionState(sendServiceRequest, { status: "idle" } as RequestFormState);
  // "Send another request" brings the form back after a request was sent.
  const [dismissed, setDismissed] = useState<RequestFormState | null>(null);
  const showSuccess = state.status === "sent" && dismissed !== state;

  const successRef = useRef<HTMLDivElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === "sent") successRef.current?.focus();
    else if (state.status !== "idle") problemRef.current?.focus();
  }, [state]);

  if (showSuccess) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="mt-8 rounded-2xl border-4 border-success bg-white p-6 text-center outline-none md:p-10"
      >
        <CircleCheck aria-hidden="true" className="mx-auto size-16 text-success" />
        <p className="mt-4 text-2xl font-bold text-navy">
          <FilledText text={successMessage} placeholders={placeholders} />
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <CallButton phone={placeholders.phone} />
          <button type="button" className={buttonClasses("secondary")} onClick={() => setDismissed(state)}>
            Send another request
          </button>
        </div>
      </div>
    );
  }

  const values: FormValues = "values" in state ? state.values : {};
  const errors: RequestErrors = state.status === "invalid" ? state.errors : {};

  return (
    <form action={formAction} noValidate className="mt-8 grid gap-6 sm:grid-cols-2 [&>*]:sm:col-span-2">
      <ProblemSummary ref={problemRef} state={state} errors={errors} placeholders={placeholders} />

      <Field name="fullName" error={errors.fullName}>
        {(props) => <input {...props} type="text" autoComplete="name" defaultValue={values.fullName} />}
      </Field>
      <Field name="phone" error={errors.phone} half>
        {(props) => <input {...props} type="tel" inputMode="tel" autoComplete="tel" defaultValue={values.phone} />}
      </Field>
      <Field name="email" error={errors.email} optional half>
        {(props) => <input {...props} type="email" autoComplete="email" defaultValue={values.email} />}
      </Field>
      <Field name="service" error={errors.service}>
        {(props) => (
          <select {...props} defaultValue={values.service ?? ""}>
            <option value="">Choose a service</option>
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
            <option value={NOT_SURE}>{NOT_SURE}</option>
          </select>
        )}
      </Field>
      <Field name="address" error={errors.address}>
        {(props) => <input {...props} type="text" autoComplete="street-address" defaultValue={values.address} />}
      </Field>
      <Field name="message" error={errors.message} optional>
        {(props) => <textarea {...props} rows={4} defaultValue={values.message} />}
      </Field>

      <div className="rounded-xl border border-silver bg-silver-soft p-4">
        <label className="flex min-h-11 cursor-pointer items-center gap-4 text-lg font-bold text-navy">
          <input
            type="checkbox"
            name="emergency"
            defaultChecked={values.emergency === "on"}
            className="size-7 shrink-0 accent-action"
          />
          This is an emergency
        </label>
        <p className="mt-2 pl-11">
          In an emergency, calling us at <FilledText text="{phone}" placeholders={placeholders} /> is the fastest way to get
          help.
        </p>
      </div>

      {/* Hidden from people; spam robots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <button type="submit" disabled={pending} className={buttonClasses("primary", "w-full disabled:opacity-70 sm:w-auto sm:justify-self-start")}>
        <Send aria-hidden="true" className="size-6 shrink-0" />
        {pending ? "Sending…" : buttonLabel}
      </button>
    </form>
  );
}

function Field({
  name,
  error,
  optional,
  half,
  children,
}: {
  name: RequestField;
  error?: string;
  optional?: boolean;
  // Half the width from 640px, next to the other half-width field.
  half?: boolean;
  children: (props: {
    id: string;
    name: string;
    className: string;
    "aria-invalid": boolean;
    "aria-required": boolean;
    "aria-describedby"?: string;
  }) => ReactNode;
}) {
  const errorId = `${name}-error`;
  return (
    <div className={half ? "sm:col-span-1!" : undefined}>
      <label htmlFor={`request-${name}`} className="block text-lg font-bold text-navy">
        {labels[name]}
      </label>
      {children({
        id: `request-${name}`,
        name,
        className: inputClasses,
        "aria-invalid": Boolean(error),
        "aria-required": !optional,
        "aria-describedby": error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className="mt-2 flex items-start gap-2 font-bold text-error">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-6 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function ProblemSummary({
  ref,
  state,
  errors,
  placeholders,
}: {
  ref: React.Ref<HTMLDivElement>;
  state: RequestFormState;
  errors: RequestErrors;
  placeholders: PlaceholderValues;
}) {
  const headingId = useId();
  if (state.status === "idle" || state.status === "sent") return null;

  const box = "rounded-2xl border-4 border-error bg-white p-5 outline-none";
  if (state.status === "too-many" || state.status === "failed") {
    return (
      <div ref={ref} tabIndex={-1} role="alert" className={box}>
        <p className="text-xl font-bold text-error">
          {state.status === "too-many"
            ? "You've sent several requests in a short time."
            : "Sorry, something went wrong and your request was not sent."}
        </p>
        <p className="mt-2">
          Please call us at <FilledText text="{phone}" placeholders={placeholders} /> so we can help you right away.
        </p>
      </div>
    );
  }

  const problems = fieldOrder.filter((field) => errors[field]);
  return (
    <div ref={ref} tabIndex={-1} role="alert" aria-labelledby={headingId} className={box}>
      <p id={headingId} className="text-xl font-bold text-error">
        {problems.length === 1 ? "Please fix 1 thing below:" : `Please fix ${problems.length} things below:`}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        {problems.map((field) => (
          <li key={field}>
            <a href={`#request-${field}`} className={cn("font-bold text-error underline")}>
              {errors[field]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
