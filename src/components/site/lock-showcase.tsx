"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

// Holds the home page padlock. A tap or click plays its snap-shut animation again
// (a fresh copy of the drawing starts its animations from the beginning). Its
// looping motion rests while it's scrolled off screen, so phones don't repaint it
// for nothing. The drawing is decorative, so this is a bonus for mouse and touch
// only and stays out of the keyboard order.
export function LockShowcase({ children, className }: { children: ReactNode; className?: string }) {
  const [plays, setPlays] = useState(0);
  const [onScreen, setOnScreen] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-resting={onScreen ? undefined : ""}
      onClick={() => setPlays((count) => count + 1)}
      className={cn("lock-showcase cursor-pointer select-none", className)}
    >
      <Fragment key={plays}>{children}</Fragment>
    </div>
  );
}
