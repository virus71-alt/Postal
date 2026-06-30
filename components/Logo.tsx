// Brand mark: an "Atlas Teal" tile holding a white location pin whose centre is
// a globe (meridian + equator). Meaning: a PLACE pinned on the world ATLAS —
// location + cartography in one. Used in the header, footer, and (mirrored in
// app/icon.svg) the favicon. Keep the two in sync.
export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#0b7468" />
      {/* location pin (white) */}
      <path
        d="M16 5.6c-4.03 0-7.3 3.27-7.3 7.3 0 5.1 7.3 12.5 7.3 12.5s7.3-7.4 7.3-12.5c0-4.03-3.27-7.3-7.3-7.3z"
        fill="#fff"
      />
      {/* globe cut into the pin: teal disc + white meridian & equator */}
      <circle cx="16" cy="12.9" r="3.7" fill="#0b7468" />
      <ellipse cx="16" cy="12.9" rx="1.5" ry="3.7" stroke="#fff" strokeWidth="0.85" />
      <line x1="12.4" y1="12.9" x2="19.6" y2="12.9" stroke="#fff" strokeWidth="0.85" />
    </svg>
  );
}

export default function Logo({
  className = '',
  markClass = 'h-9 w-9',
}: {
  className?: string;
  markClass?: string;
}) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <LogoMark className={markClass} />
      <span className="text-lg font-semibold tracking-tight text-ink">
        Postal<span className="text-accent">Atlas</span>
      </span>
    </span>
  );
}
