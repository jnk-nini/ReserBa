import { formatClock, minutesToTime } from "@/lib/time";

// The day strip: one amenity's day drawn as a bar from opening to closing time.
// Taken time is filled in, so a person sees at a glance where a new booking
// fits. The lighter tail after a booking is its buffer time.

export type StripSegment = {
  // Minutes since midnight, Philippine time.
  from: number;
  to: number;
  // "clash" is a chosen time that does not fit.
  kind: "pending" | "approved" | "blocked" | "choice" | "buffer" | "clash";
  label?: string;
};

const fills: Record<StripSegment["kind"], string> = {
  approved: "bg-approved",
  pending: "bg-pending-fill",
  blocked: "stripes",
  choice: "bg-brand/25 ring-2 ring-brand ring-inset",
  buffer: "bg-brand/10 ring-1 ring-brand/40 ring-inset",
  clash: "bg-refused/30 ring-2 ring-refused ring-inset",
};

export default function DayStrip({
  openMinutes,
  closeMinutes,
  segments,
}: {
  openMinutes: number;
  closeMinutes: number;
  segments: StripSegment[];
}) {
  const span = closeMinutes - openMinutes;
  // A tick every two hours, on the hour.
  const ticks: number[] = [];
  for (let minute = Math.ceil(openMinutes / 120) * 120; minute <= closeMinutes; minute += 120) {
    ticks.push(minute);
  }

  function place(from: number, to: number) {
    const start = Math.max(from, openMinutes);
    const end = Math.min(to, closeMinutes);
    if (end <= start) return null;
    return { left: `${((start - openMinutes) / span) * 100}%`, width: `${((end - start) / span) * 100}%` };
  }

  return (
    <div>
      <div className="relative h-11 overflow-hidden rounded-xl border border-line-strong bg-surface">
        {segments.map((segment, index) => {
          const position = place(segment.from, segment.to);
          if (!position) return null;
          // The chosen time keeps one key, so it slides to its new place
          // instead of jumping when the person changes it.
          const picked = segment.kind === "choice" || segment.kind === "clash";
          const key = picked ? "picked" : segment.kind === "buffer" ? "picked-buffer" : index;
          const moves = picked || segment.kind === "buffer";
          return (
            <div
              key={key}
              className={`absolute inset-y-0 ${moves ? "transition-[left,width,background-color] duration-300 ease-settle" : ""} ${fills[segment.kind]}`}
              style={position}
              title={segment.label}
            />
          );
        })}
      </div>
      <div className="relative mt-1 h-5 text-xs text-ink-soft number" aria-hidden="true">
        {ticks.map((minute) => (
          <span
            key={minute}
            className="absolute -translate-x-1/2 whitespace-nowrap first:translate-x-0 last:-translate-x-full max-sm:nth-even:hidden"
            style={{ left: `${((minute - openMinutes) / span) * 100}%` }}
          >
            {formatClock(minutesToTime(minute)).replace(":00 ", "")}
          </span>
        ))}
      </div>
    </div>
  );
}

// The key under a strip, so the colours are never a guess.
export function StripLegend({
  showChoice = false,
  choiceLabel = "Your time",
}: {
  showChoice?: boolean;
  choiceLabel?: string;
}) {
  const items: Array<[string, string]> = [
    ["bg-approved", "Approved"],
    ["bg-pending-fill", "Waiting for approval"],
    ["stripes", "Blocked by the HOA"],
  ];
  if (showChoice) {
    items.push(["bg-brand/25 ring-2 ring-brand ring-inset", choiceLabel]);
    items.push(["bg-brand/10 ring-1 ring-brand/40 ring-inset", "Buffer after it"]);
  }
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
      {items.map(([fill, label]) => (
        <li key={label} className="flex items-center gap-1.5">
          <span className={`inline-block size-3.5 rounded-sm ${fill}`} />
          {label}
        </li>
      ))}
    </ul>
  );
}
