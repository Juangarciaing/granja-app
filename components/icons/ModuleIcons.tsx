type IconProps = {
  className?: string;
};

// Flat, single-viewBox module glyphs (viewBox="-32 -32 64 64", origin-centered)
// for the landing/dashboard benefit cards. `currentColor` drives the main
// shape so callers set color via a text-color class; the light contrast
// details use `var(--surface-0)` so they stay legible in both themes.

export function SowIcon({ className }: IconProps) {
  return (
    <svg viewBox="-32 -32 64 64" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="0" cy="2" r="26" />
      <polygon points="-18,-16 -8,-32 -4,-14" />
      <polygon points="18,-16 8,-32 4,-14" />
      <ellipse cx="0" cy="8" rx="13" ry="9" fill="var(--surface-0)" />
      <circle cx="-4.5" cy="8" r="2.4" />
      <circle cx="4.5" cy="8" r="2.4" />
    </svg>
  );
}

export function ScaleIcon({ className }: IconProps) {
  return (
    <svg viewBox="-32 -32 64 64" className={className} fill="currentColor" aria-hidden="true">
      <rect x="-3" y="-28" width="6" height="46" rx="2" />
      <rect x="-24" y="-24" width="48" height="6" rx="2" />
      <rect x="-26" y="20" width="52" height="6" rx="2" />
      <circle cx="-20" cy="0" r="9" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="20" cy="0" r="9" fill="none" stroke="currentColor" strokeWidth="4" />
      <line x1="-20" y1="-21" x2="-20" y2="-9" stroke="currentColor" strokeWidth="3" />
      <line x1="20" y1="-21" x2="20" y2="-9" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

export function MilkDropIcon({ className }: IconProps) {
  return (
    <svg viewBox="-32 -32 64 64" className={className} fill="currentColor" aria-hidden="true">
      <path d="M0,-30 C14,-10 24,4 24,16 A24,24 0 1 1 -24,16 C-24,4 -14,-10 0,-30 Z" />
      <ellipse cx="-7" cy="12" rx="5" ry="7" fill="var(--surface-0)" opacity="0.55" />
    </svg>
  );
}

export function CycleHeartIcon({ className }: IconProps) {
  return (
    <svg viewBox="-32 -32 64 64" className={className} fill="currentColor" aria-hidden="true">
      <path d="M0,20 C-16,7 -28,-2 -28,-14 C-28,-24 -19,-29 0,-16 C19,-29 28,-24 28,-14 C28,-2 16,7 0,20 Z" />
      <g transform="translate(15,18)">
        <path
          d="M 11 0 A 11 11 0 1 0 5 9.8"
          fill="none"
          stroke="var(--surface-0)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <polygon points="5,2 13,0 9,9" fill="var(--surface-0)" />
      </g>
    </svg>
  );
}
