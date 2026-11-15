"use client";

import { useEffect, useRef, type ReactNode } from "react";

// The header's main bar. It sticks to the top of the screen, and once the visitor
// starts scrolling it gets data-scrolled, which globals.css eases into a slimmer
// look (smaller logo, a shadow underneath). On and off at different points, so a
// page resting near the top doesn't flicker between the two.
export function StickyHeader({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrolled = header.hasAttribute("data-scrolled");
      if (!scrolled && window.scrollY > 24) header.setAttribute("data-scrolled", "");
      else if (scrolled && window.scrollY < 4) header.removeAttribute("data-scrolled");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header ref={ref} className="site-header on-dark sticky top-0 z-40 border-b border-white/10 text-white">
      {children}
    </header>
  );
}
