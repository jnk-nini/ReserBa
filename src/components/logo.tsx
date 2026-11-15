// The ReserBa mark and name. The mark is two bars that sit side by side
// without touching: two bookings that do not overlap.

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--color-brand)" />
      <rect x="6" y="9" width="13" height="5.5" rx="2.75" fill="#ffffff" />
      <rect x="13" y="17.5" width="13" height="5.5" rx="2.75" fill="#ffffff" fillOpacity="0.55" />
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="text-[1.125rem] font-semibold tracking-tight text-ink">ReserBa</span>
    </span>
  );
}
