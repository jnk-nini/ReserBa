"use client";

import { useRef, useState } from "react";
import { formatClock, minutesToTime } from "@/lib/time";

// The day strip: one amenity's day drawn as a bar from opening to closing time.
// Taken time is filled in, so a person sees at a glance where a new booking
// fits. The lighter tail after a booking is its buffer time.
//
// When `onSelect` is given the strip is also a control: press and drag across
// it to choose a time, in steps of 30 minutes. The form's From and To lists
// stay as the keyboard way to do the same thing.

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

const STEP = 30;

export default function DayStrip({
  openMinutes,
  closeMinutes,
  segments,
  onSelect,
}: {
  openMinutes: number;
  closeMinutes: number;
  segments: StripSegment[];
  onSelect?: (from: number, to: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const anchor = useRef<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
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

  // The 30-minute slot under the pointer, as its start minute.
  function slotAt(clientX: number) {
    const box = track.current?.getBoundingClientRect();
    if (!box) return openMinutes;
    const ratio = Math.min(Math.max((clientX - box.left) / box.width, 0), 0.9999);
    const minute = openMinutes + ratio * span;
    return openMinutes + Math.floor((minute - openMinutes) / STEP) * STEP;
  }

  function choose(a: number, b: number) {
    const from = Math.min(a, b);
    const to = Math.min(Math.max(a, b) + STEP, closeMinutes);
    onSelect?.(from, to);
  }

  const interactive = Boolean(onSelect);

  return (
    <div>
      <div
        ref={track}
        className={`relative h-12 touch-pan-y overflow-hidden rounded-lg border border-line-strong bg-surface select-none ${
          interactive ? "cursor-crosshair" : ""
        }`}
        onPointerDown={
          interactive
            ? (event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                anchor.current = slotAt(event.clientX);
                setDragging(true);
                choose(anchor.current, anchor.current);
              }
            : undefined
        }
        onPointerMove={
          interactive
            ? (event) => {
                setHover(slotAt(event.clientX));
                if (anchor.current !== null) choose(anchor.current, slotAt(event.clientX));
              }
            : undefined
        }
        onPointerUp={
          interactive
            ? () => {
                anchor.current = null;
                setDragging(false);
              }
            : undefined
        }
        onPointerCancel={
          interactive
            ? () => {
                anchor.current = null;
                setDragging(false);
              }
            : undefined
        }
        onPointerLeave={interactive ? () => setHover(null) : undefined}
      >
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
        {interactive && hover !== null && !dragging && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 border-x border-brand/60 bg-brand/10"
            style={place(hover, hover + STEP) ?? undefined}
          />
        )}
      </div>
      {interactive && hover !== null && (
        <p className="number mt-1 text-xs text-ink-soft" aria-hidden="true">
          {formatClock(minutesToTime(hover))}
        </p>
      )}
      <div className="number relative mt-1.5 h-5 text-xs text-ink-soft" aria-hidden="true">
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
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] text-ink-soft">
      {items.map(([fill, label]) => (
        <li key={label} className="flex items-center gap-1.5">
          <span className={`inline-block size-3 rounded-[3px] ${fill}`} />
          {label}
        </li>
      ))}
    </ul>
  );
}
