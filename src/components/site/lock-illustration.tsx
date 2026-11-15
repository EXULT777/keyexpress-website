// A large padlock for the home page's top section: a chrome shackle like the silver
// in the logo, a royal blue body with a polished rim, and a keyhole that glows. On
// load the shackle snaps shut and the keyhole lights up (globals.css). Decorative.
export function LockIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 380" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <radialGradient id="lock-glow" cx="0.5" cy="0.58" r="0.5">
          <stop offset="0" stopColor="#5c7aea" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#3d56b2" stopOpacity="0.18" />
          <stop offset="1" stopColor="#3d56b2" stopOpacity="0" />
        </radialGradient>
        {/* Brushed chrome: bright and dark bands across, like the logo's silver. */}
        <linearGradient id="lock-chrome" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7e879c" />
          <stop offset="0.18" stopColor="#e9edf5" />
          <stop offset="0.36" stopColor="#a7afc0" />
          <stop offset="0.55" stopColor="#ffffff" />
          <stop offset="0.78" stopColor="#b4bccb" />
          <stop offset="1" stopColor="#6f788e" />
        </linearGradient>
        <linearGradient id="lock-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#aab3c6" />
          <stop offset="1" stopColor="#5d6782" />
        </linearGradient>
        <linearGradient id="lock-body" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#4a66d4" />
          <stop offset="0.45" stopColor="#1a2fa8" />
          <stop offset="1" stopColor="#0a1450" />
        </linearGradient>
        <linearGradient id="lock-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lock-plate" cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#c9cfdb" />
          <stop offset="1" stopColor="#7a849a" />
        </radialGradient>
        <radialGradient id="lock-hole-light" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#c9d5ff" />
          <stop offset="0.45" stopColor="#5c7aea" />
          <stop offset="1" stopColor="#14279b" />
        </radialGradient>
        <filter id="lock-blur-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="lock-blur-shadow" x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <clipPath id="lock-body-clip">
          <rect x="58" y="168" width="204" height="176" rx="38" />
        </clipPath>
      </defs>

      {/* Glow and faint security rings behind the lock. */}
      <circle cx="160" cy="222" r="160" fill="url(#lock-glow)" />
      <circle cx="160" cy="236" r="138" fill="none" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1.5" />
      <circle
        cx="160"
        cy="236"
        r="112"
        fill="none"
        stroke="#9fb1f5"
        strokeOpacity="0.28"
        strokeWidth="1.5"
        strokeDasharray="2 10"
        strokeLinecap="round"
      />

      <g className="lock-float">
        {/* Shadow on the ground. */}
        <ellipse cx="160" cy="362" rx="92" ry="9" fill="#020624" opacity="0.55" filter="url(#lock-blur-shadow)" />

        {/* Shackle: chrome with a bright edge on the left for depth. */}
        <g className="lock-shackle">
          <path
            d="M104 196V112a56 56 0 0 1 112 0v84"
            fill="none"
            stroke="url(#lock-chrome)"
            strokeWidth="28"
            strokeLinecap="round"
          />
          <path
            d="M96 190V112a64 64 0 0 1 84-60.7"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.55"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* Body: royal blue with a polished rim and a gloss across the top. */}
        <rect x="58" y="168" width="204" height="176" rx="38" fill="url(#lock-body)" />
        <g clipPath="url(#lock-body-clip)">
          <path d="M58 168h204v62c-64 18-140 18-204 0z" fill="url(#lock-gloss)" />
          <rect x="58" y="168" width="204" height="176" rx="38" fill="none" stroke="#000a3a" strokeOpacity="0.45" strokeWidth="14" />
        </g>
        <rect x="58" y="168" width="204" height="176" rx="38" fill="none" stroke="url(#lock-rim)" strokeWidth="6" />
        <rect x="76" y="186" width="168" height="140" rx="26" fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1.5" />

        {/* Rivets. */}
        {[
          [84, 194],
          [236, 194],
          [84, 318],
          [236, 318],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.5" fill="url(#lock-plate)" />
        ))}

        {/* Keyhole on a chrome plate, lit from inside. */}
        <circle cx="160" cy="250" r="46" fill="#020a3a" opacity="0.45" filter="url(#lock-blur-soft)" />
        <circle cx="160" cy="248" r="42" fill="url(#lock-plate)" />
        <circle cx="160" cy="248" r="42" fill="none" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="1.5" />
        <circle cx="160" cy="248" r="34" fill="none" stroke="#5d6782" strokeOpacity="0.5" strokeWidth="1" />
        <path d="M160 222a13 13 0 0 1 7.6 23.6l4.4 25.4h-24l4.4-25.4A13 13 0 0 1 160 222z" fill="#050b30" />
        <g className="lock-keyglow">
          <circle cx="160" cy="248" r="30" fill="#5c7aea" opacity="0.5" filter="url(#lock-blur-soft)" />
          <path d="M160 226a9 9 0 0 1 5.2 16.4l3.4 24.6h-17.2l3.4-24.6A9 9 0 0 1 160 226z" fill="url(#lock-hole-light)" />
        </g>
      </g>
    </svg>
  );
}
