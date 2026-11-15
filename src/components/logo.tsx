// The ReserBa mark and name. The mark is the arched gate of a subdivision with
// its two leaves standing side by side without touching: two bookings that do
// not overlap. The same drawing is used for the browser icon (app/icon.svg)
// and the home screen icons (public/icon-*.png).

const leftLeaf = "M7.5 25V15a8.5 8.5 0 0 1 7.5-8.44V25z";
const rightLeaf = "M17 25V6.56A8.5 8.5 0 0 1 24.5 15v10z";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--color-brand)" />
      <path d={leftLeaf} fill="var(--color-on-brand)" />
      <path d={rightLeaf} fill="var(--color-brass-soft)" />
    </svg>
  );
}

// `onDark` is for the mark on an evergreen background: the tile is dropped and
// only the two leaves are drawn.
export default function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      {onDark ? (
        <svg viewBox="5 4 22 24" className="h-8 w-[1.85rem]" aria-hidden="true">
          <path d={leftLeaf} fill="var(--color-on-brand)" />
          <path d={rightLeaf} fill="var(--color-brass-soft)" />
        </svg>
      ) : (
        <LogoMark />
      )}
      <span
        className={`display text-[1.625rem] leading-none font-semibold ${onDark ? "text-on-brand" : "text-ink"}`}
      >
        ReserBa
      </span>
    </span>
  );
}
