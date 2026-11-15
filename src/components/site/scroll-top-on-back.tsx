"use client";

import { useEffect } from "react";

// The browser's Back and Forward buttons open a page at the top, like a link does,
// instead of where the visitor had scrolled to (e.g. down at Services).
export function ScrollTopOnBack() {
  useEffect(() => {
    const before = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const onPopState = () => window.scrollTo({ top: 0, behavior: "instant" });
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.history.scrollRestoration = before;
    };
  }, []);
  return null;
}
