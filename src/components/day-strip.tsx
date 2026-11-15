import { formatClock, minutesToTime } from "@/lib/time";

// The day strip: one amenity's day drawn as a bar from opening to closing time.
// Taken time is filled in, so a person sees at a glance where a new booking
// fits. The lighter tail after a booking is its buffer time.

export type StripSegment = {
  // Minutes since midnight, Philippine time.
  from: number;
  to: number;
  kind: "pending" | "approved" | "blocked" | "choice" | "buffer";
  label?: string;
};

const fills: Record<StripSegment["kind"], string> = {
  approved: "bg-approved",
  pending: "bg-pending",
  blocked: "stripes",
  choice: "bg-brand/25 ring-2 ring-brand ring-inset",
  buffer: "bg-brand/10 ring-1 ring-brand/40 ring-inset",
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
          return (
            <div
              key={index}
              className={`absolute inset-y-0 ${fills[segment.kind]}`}
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
            className="absolute -translate-x-1/2 whitespace-nowrap first:translate-x-0 last:-translate-x-full"
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
    ["bg-pending", "Waiting for approval"],
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
