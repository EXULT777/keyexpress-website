// A large silver key on a blue tile, the same mark as the default logo. Decorative.
export function KeyIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <linearGradient id="key-illustration-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1e56c7" />
          <stop offset="1" stopColor="#0b2545" />
        </linearGradient>
        <linearGradient id="key-illustration-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#c5ccd6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#key-illustration-tile)" />
      <g fill="none" stroke="url(#key-illustration-metal)" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="22" cy="22" r="9" strokeWidth="6" />
        <path d="M28.5 28.5 49 49" strokeWidth="6" />
        <path d="M41 41l5-5M46 46l4-4" strokeWidth="5" />
      </g>
    </svg>
  );
}
