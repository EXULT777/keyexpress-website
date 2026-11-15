"use client";

import { useSyncExternalStore } from "react";

const noSubscription = () => () => {};

// A date and time in the viewer's own time zone. The server doesn't know that
// zone, so it renders UTC, and the browser swaps in local time after loading.
export function LocalTime({ iso }: { iso: string }) {
  const text = useSyncExternalStore(
    noSubscription,
    () => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }),
    () => `${new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC`,
  );
  return <time dateTime={iso}>{text}</time>;
}
