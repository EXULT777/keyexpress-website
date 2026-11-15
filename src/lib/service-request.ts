// Shared by the Request Service form, the server that checks it, and the Admin inbox.

export const NOT_SURE = "Not sure";

export const requestStatuses = ["NEW", "CONTACTED", "DONE"] as const;
export type RequestStatus = (typeof requestStatuses)[number];

export const statusLabels: Record<RequestStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  DONE: "Done",
};

export function isRequestStatus(value: string): value is RequestStatus {
  return (requestStatuses as readonly string[]).includes(value);
}

// A field people never see. Spam robots fill in every field, so a request with
// this one filled in is dropped (while the robot is told it was sent).
export const HONEYPOT_FIELD = "website";

export type RequestField = "fullName" | "phone" | "email" | "service" | "address" | "message";
export type RequestErrors = Partial<Record<RequestField, string>>;
