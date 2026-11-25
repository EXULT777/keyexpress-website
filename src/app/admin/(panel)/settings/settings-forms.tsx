"use client";

import { RotateCcw, Upload } from "lucide-react";
import { useActionState, useState } from "react";
import { AdminCard, CheckboxField, errorFor, FieldError, ResultMessage, SaveRow, TextField } from "@/components/admin/form-parts";
import { ListEditor } from "@/components/admin/list-editor";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { buttonClasses } from "@/components/site/buttons";
import { IDLE } from "@/lib/action-result";
import type { BusinessSettings } from "@/server/content";
import { restoreDefaultLogo, saveBusinessSettings, uploadLogo } from "./actions";

export function SettingsForm({ settings }: { settings: BusinessSettings }) {
  const { state, onSubmit, pending } = useAdminForm(saveBusinessSettings);
  const error = (name: string) => errorFor(state, name);

  return (
    <AdminCard title="Business details">
      <form onSubmit={onSubmit} noValidate className="space-y-8">
        <TextField name="businessName" label="Business name" defaultValue={settings.businessName} error={error("businessName")} />
        <TextField
          name="phone"
          label="Phone number"
          hint="Shown on every page, and used by every Call button."
          type="tel"
          defaultValue={settings.phone}
          error={error("phone")}
        />
        <TextField name="email" label="Email address" hint="Shown on the website." type="email" defaultValue={settings.email} error={error("email")} />
        <TextField
          name="notificationEmail"
          label="Send new service requests to (optional)"
          hint="Leave this empty to use the email address above. Emails are only sent once email sending is set up (see DEPLOY.md)."
          type="email"
          defaultValue={settings.notificationEmail}
          error={error("notificationEmail")}
        />
        <TextField
          name="serviceAreaCity"
          label="Your city"
          hint="Used wherever the text says {city}, for example “serving {city} and nearby areas”."
          defaultValue={settings.serviceAreaCity}
          error={error("serviceAreaCity")}
        />
        <ListEditor
          name="towns"
          label="Nearby towns you serve"
          hint="Listed under “Areas We Serve”."
          itemLabel="Town"
          addLabel="Add a town"
          initial={settings.towns}
          error={error("towns")}
        />
        <ListEditor
          name="paymentMethods"
          label="Payment methods you accept"
          hint="Listed at the bottom of every page."
          itemLabel="Payment method"
          addLabel="Add a payment method"
          initial={settings.paymentMethods}
          error={error("paymentMethods")}
        />
        <CheckboxField
          name="emergencyBadge"
          label="Show the red “24/7 Emergency Service” badge"
          hint="At the top of every page."
          defaultChecked={settings.emergencyBadge}
        />
        <TextField
          name="licenseNumber"
          label="License number (optional)"
          hint="Shown at the top and bottom of every page once filled in. Many states require it."
          defaultValue={settings.licenseNumber}
          error={error("licenseNumber")}
        />
        <TextField
          name="footerText"
          label="Short description for the bottom of the page"
          multiline
          rows={3}
          defaultValue={settings.footerText}
          error={error("footerText")}
        />
        <SaveRow state={state} pending={pending} />
      </form>
    </AdminCard>
  );
}

export function LogoForm({
  logoUrl,
  hasCustomLogo,
  businessName,
}: {
  logoUrl: string;
  hasCustomLogo: boolean;
  businessName: string;
}) {
  const { state, onSubmit, pending } = useAdminForm(uploadLogo);
  const [restoreState, restore, restoring] = useActionState(restoreDefaultLogo, IDLE);
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <AdminCard title="Logo">
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div>
          <p className="font-bold text-navy">Logo on the website now</p>
          <div className="mt-2 inline-block rounded-xl border-2 border-silver bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt={`Current logo: ${businessName}`} className="h-12 w-auto max-w-full" />
          </div>
          {preview && (
            <>
              <p className="mt-4 font-bold text-navy">Your new logo (not saved yet)</p>
              <div className="mt-2 inline-block rounded-xl border-2 border-action bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview of the new logo" className="h-12 w-auto max-w-full" />
              </div>
            </>
          )}
        </div>
        <form
          // The preview goes away once the upload starts; the page then shows the saved logo.
          onSubmit={(event) => {
            setPreview(null);
            onSubmit(event);
          }}
          key={logoUrl}
          className="flex-1 space-y-4"
        >
          <div>
            <label htmlFor="logo-file" className="block text-lg font-bold text-navy">
              Choose a new logo
            </label>
            <p id="logo-file-hint" className="mt-1 text-ink-soft">
              A PNG, JPG, WebP or SVG picture, up to 2 MB. A wide logo on a white or clear background works best.
            </p>
            <input
              id="logo-file"
              name="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              aria-describedby="logo-file-hint logo-error"
              aria-invalid={Boolean(errorFor(state, "logo"))}
              onChange={(event) => {
                const chosen = event.target.files?.[0];
                setPreview(chosen ? URL.createObjectURL(chosen) : null);
              }}
              className="mt-2 block w-full rounded-xl border-2 border-ink-soft bg-white p-3 text-lg file:mr-4 file:min-h-12 file:rounded-lg file:border-0 file:bg-silver-light file:px-4 file:font-bold file:text-navy"
            />
            <FieldError id="logo-error" error={errorFor(state, "logo")} />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button type="submit" disabled={pending} className={buttonClasses("primary", "disabled:opacity-70")}>
              <Upload aria-hidden="true" className="size-6 shrink-0" />
              {pending ? "Uploading…" : "Upload new logo"}
            </button>
            <ResultMessage state={state} />
          </div>
        </form>
      </div>
      {(hasCustomLogo || restoreState.status !== "idle") && (
        <div className="mt-8 flex flex-col gap-4 border-t-2 border-silver-soft pt-6 sm:flex-row sm:items-center">
          {hasCustomLogo && (
            <form action={restore}>
              <button type="submit" disabled={restoring} className={buttonClasses("secondary", "disabled:opacity-70")}>
                <RotateCcw aria-hidden="true" className="size-6 shrink-0" />
                Use the original Keys Express logo again
              </button>
            </form>
          )}
          {/* Outside the form: the button goes away once the original logo is back, the message stays. */}
          <ResultMessage state={restoreState} />
        </div>
      )}
    </AdminCard>
  );
}
