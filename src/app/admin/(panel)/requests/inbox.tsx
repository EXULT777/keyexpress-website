"use client";

import { CircleCheck, Phone, Siren, Trash2, Undo2 } from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { ResultMessage } from "@/components/admin/form-parts";
import { LocalTime } from "@/components/admin/local-time";
import { buttonClasses } from "@/components/site/buttons";
import { IDLE, type ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/cn";
import { telHref } from "@/lib/phone";
import { statusLabels, type RequestStatus } from "@/lib/service-request";
import type { ServiceRequestRecord } from "@/server/service-requests";
import { deleteRequest, setRequestStatus } from "./actions";

// A Service Request as the browser gets it: the date travels as text.
export type InboxRequest = Omit<ServiceRequestRecord, "createdAt"> & { receivedAt: string };

const smallButton =
  "inline-flex min-h-14 items-center gap-2 rounded-xl border-2 border-silver bg-white px-3 font-bold text-navy hover:border-action hover:text-action disabled:opacity-40";

const nextSteps: Record<RequestStatus, { status: RequestStatus; label: string }[]> = {
  NEW: [
    { status: "CONTACTED", label: "Mark as contacted" },
    { status: "DONE", label: "Mark as done" },
  ],
  CONTACTED: [
    { status: "DONE", label: "Mark as done" },
    { status: "NEW", label: "Mark as new again" },
  ],
  DONE: [{ status: "NEW", label: "Mark as new again" }],
};

const statusChip: Record<RequestStatus, string> = {
  NEW: "bg-action text-white",
  CONTACTED: "bg-silver-light text-navy",
  DONE: "bg-silver-light text-success",
};

// The requests, as a table on large screens and as cards on phones, with one
// message at the top saying what just happened.
export function Inbox({ requests }: { requests: InboxRequest[] }) {
  const [state, run, pending] = useActionState(
    (_previous: ActionResult, change: () => Promise<ActionResult>) => change(),
    IDLE,
  );
  const [confirming, setConfirming] = useState<number | null>(null);
  const act = (change: () => Promise<ActionResult>) => startTransition(() => run(change));

  function actionsFor(request: InboxRequest) {
    if (confirming === request.id) {
      return (
        <div role="alert" className="rounded-xl border-4 border-error p-3">
          <p className="font-bold text-error">Delete the request from {request.fullName}? This can&apos;t be undone.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirming(null);
                act(() => deleteRequest(request.id));
              }}
              className="inline-flex min-h-14 items-center gap-2 rounded-xl bg-error px-4 font-bold text-white"
            >
              <Trash2 aria-hidden="true" className="size-5" /> Yes, delete it
            </button>
            <button type="button" onClick={() => setConfirming(null)} className={smallButton}>
              No, keep it
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-wrap gap-2">
        {nextSteps[request.status].map((step) => (
          <button
            key={step.status}
            type="button"
            disabled={pending}
            onClick={() => act(() => setRequestStatus(request.id, step.status))}
            className={smallButton}
          >
            {step.status === "NEW" ? <Undo2 aria-hidden="true" className="size-5" /> : <CircleCheck aria-hidden="true" className="size-5" />}
            {step.label}
            <span className="sr-only">: {request.fullName}</span>
          </button>
        ))}
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirming(request.id)}
          className={cn(smallButton, "text-error hover:border-error hover:text-error")}
        >
          <Trash2 aria-hidden="true" className="size-5" /> Delete<span className="sr-only">: request from {request.fullName}</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 min-h-8">
        <ResultMessage state={state} />
      </div>

      {requests.length === 0 && <p className="rounded-2xl border-2 border-silver bg-white p-6 text-lg">No requests here.</p>}

      {requests.length > 0 && (
        <>
          <table className="hidden w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border-2 border-silver bg-white xl:table">
            <caption className="sr-only">Service requests, newest first</caption>
            <thead className="bg-silver-light text-left">
              <tr>
                <th scope="col" className="w-44 p-4">Received</th>
                <th scope="col" className="w-60 p-4">Customer</th>
                <th scope="col" className="p-4">Request</th>
                <th scope="col" className="w-64 p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className={cn("align-top", request.emergency && "bg-[#fdeceb]")}>
                  <td className={cn("border-t-2 border-silver-soft p-4", request.emergency && "border-l-8 border-l-emergency")}>
                    <LocalTime iso={request.receivedAt} />
                    {request.emergency && (
                      <div className="mt-2">
                        <EmergencyFlag />
                      </div>
                    )}
                  </td>
                  <td className="border-t-2 border-silver-soft p-4">
                    <p className="font-bold text-navy">{request.fullName}</p>
                    <PhoneLink phone={request.phone} />
                    {request.email && (
                      <p className="break-all">
                        <a href={`mailto:${request.email}`} className="text-action underline">
                          {request.email}
                        </a>
                      </p>
                    )}
                  </td>
                  <td className="border-t-2 border-silver-soft p-4">
                    <p className="font-bold">{request.service}</p>
                    <p>{request.address}</p>
                    {request.message && <p className="mt-2 whitespace-pre-line">“{request.message}”</p>}
                  </td>
                  <td className="border-t-2 border-silver-soft p-4">
                    <Status request={request} />
                    <div className="mt-3">{actionsFor(request)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="space-y-4 xl:hidden">
            {requests.map((request) => (
              <li
                key={request.id}
                className={cn(
                  "rounded-2xl border-2 bg-white p-5",
                  request.emergency ? "border-emergency border-l-8 bg-[#fdeceb]" : "border-silver",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {request.emergency && <EmergencyFlag />}
                  <Status request={request} />
                </div>
                <h2 className="mt-3 text-xl">{request.fullName}</h2>
                <p className="text-ink-soft">
                  <LocalTime iso={request.receivedAt} />
                </p>
                <dl className="mt-3 space-y-2">
                  <div>
                    <dt className="font-bold text-navy">Phone</dt>
                    <dd>
                      <PhoneLink phone={request.phone} />
                    </dd>
                  </div>
                  {request.email && (
                    <div>
                      <dt className="font-bold text-navy">Email</dt>
                      <dd className="break-all">
                        <a href={`mailto:${request.email}`} className="text-action underline">
                          {request.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-bold text-navy">Service</dt>
                    <dd>{request.service}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-navy">Address or area</dt>
                    <dd>{request.address}</dd>
                  </div>
                  {request.message && (
                    <div>
                      <dt className="font-bold text-navy">Message</dt>
                      <dd className="whitespace-pre-line">{request.message}</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-4">
                  {actionsFor(request)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="sr-only" aria-live="polite">
        {pending ? "Saving…" : ""}
      </p>
      <p className="mt-6">
        <a href="#main" className={buttonClasses("secondary")}>
          Back to the top
        </a>
      </p>
    </div>
  );
}

function Status({ request }: { request: InboxRequest }) {
  return (
    <span className={cn("inline-block rounded-full px-3 py-1 font-bold", statusChip[request.status])}>
      {statusLabels[request.status]}
    </span>
  );
}

// Marks a Service Request the Customer flagged as an Emergency.
function EmergencyFlag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emergency px-3 py-1 font-bold text-white">
      <Siren aria-hidden="true" className="size-5" /> EMERGENCY
    </span>
  );
}

function PhoneLink({ phone }: { phone: string }) {
  return (
    <a href={telHref(phone)} className="inline-flex items-center gap-2 font-bold whitespace-nowrap text-action underline">
      <Phone aria-hidden="true" className="size-5" />
      {phone}
    </a>
  );
}
