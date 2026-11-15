"use client";

import { useState } from "react";
import DayStrip, { StripLegend, type StripSegment } from "@/components/day-strip";
import { formatClock, minutesToTime } from "@/lib/time";

// The sample on the first page. A visitor picks a time and sees the same
// answer the real booking form gives: free, taken, closed, or too close to
// the booking before it. The day shown is made up; nothing is saved.

type SampleAmenity = {
  name: string;
  open: number;
  close: number;
  buffer: number;
  taken: StripSegment[];
};

const amenities: SampleAmenity[] = [
  {
    name: "Clubhouse",
    open: 480,
    close: 1320,
    buffer: 30,
    taken: [
      { from: 540, to: 720, kind: "blocked", label: "Blocked by the HOA" },
      { from: 840, to: 1080, kind: "approved", label: "Approved" },
      { from: 1140, to: 1260, kind: "pending", label: "Waiting for approval" },
    ],
  },
  {
    name: "Basketball court",
    open: 360,
    close: 1320,
    buffer: 15,
    taken: [
      { from: 420, to: 540, kind: "approved", label: "Approved" },
      { from: 960, to: 1080, kind: "pending", label: "Waiting for approval" },
      { from: 1140, to: 1260, kind: "approved", label: "Approved" },
    ],
  },
  {
    name: "Swimming pool",
    open: 480,
    close: 1200,
    buffer: 30,
    taken: [
      { from: 480, to: 600, kind: "blocked", label: "Blocked by the HOA" },
      { from: 780, to: 960, kind: "approved", label: "Approved" },
    ],
  },
];

const lengths = [60, 120, 180, 240];

function answerFor(amenity: SampleAmenity, start: number, end: number) {
  if (end > amenity.close) {
    return { ok: false, text: `The ${amenity.name.toLowerCase()} closes at ${formatClock(minutesToTime(amenity.close))}.` };
  }
  for (const taken of amenity.taken) {
    // A booking holds its time plus the buffer after it.
    const hold = taken.kind === "blocked" ? 0 : amenity.buffer;
    if (start < taken.to && end > taken.from) {
      return {
        ok: false,
        text: taken.kind === "blocked" ? "The HOA blocked part of this time." : "This overlaps a booking. Two bookings cannot share a time.",
      };
    }
    if (start < taken.to + hold && end > taken.from) {
      return { ok: false, text: `Too close to the booking before it. ${amenity.buffer} minutes are kept free after each one.` };
    }
    if (end + amenity.buffer > taken.from && start < taken.from && taken.kind !== "blocked") {
      return { ok: false, text: `Too close to the next booking. ${amenity.buffer} minutes are kept free after yours.` };
    }
  }
  return { ok: true, text: "This time is free. A resident could send the request now." };
}

export default function TryATime() {
  const [index, setIndex] = useState(0);
  const [start, setStart] = useState(750);
  const [length, setLength] = useState(60);

  const amenity = amenities[index];
  const starts: number[] = [];
  for (let minute = amenity.open; minute < amenity.close; minute += 30) starts.push(minute);
  // A start time that the newly picked amenity does not have falls back to its opening time.
  const from = starts.includes(start) ? start : amenity.open;
  const to = from + length;
  const answer = answerFor(amenity, from, to);

  const segments: StripSegment[] = [
    ...amenity.taken,
    { from, to: Math.min(to, amenity.close), kind: "choice", label: "Your time" },
    { from: to, to: Math.min(to + amenity.buffer, amenity.close), kind: "buffer", label: "Buffer" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="label col-span-2">
          Amenity
          <select className="input" value={index} onChange={(event) => setIndex(Number(event.target.value))}>
            {amenities.map((item, position) => (
              <option key={item.name} value={position}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="label">
          Start
          <select className="input" value={from} onChange={(event) => setStart(Number(event.target.value))}>
            {starts.map((minute) => (
              <option key={minute} value={minute}>
                {formatClock(minutesToTime(minute))}
              </option>
            ))}
          </select>
        </label>
        <label className="label">
          How long
          <select className="input" value={length} onChange={(event) => setLength(Number(event.target.value))}>
            {lengths.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes / 60} {minutes === 60 ? "hour" : "hours"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <DayStrip openMinutes={amenity.open} closeMinutes={amenity.close} segments={segments} />
        <div className="mt-2">
          <StripLegend showChoice />
        </div>
      </div>

      <p
        role="status"
        className={`flex flex-col gap-0.5 rounded-2xl border px-4 py-3 text-base font-medium ${
          answer.ok
            ? "border-approved/30 bg-approved-tint text-approved"
            : "border-pending/30 bg-pending-tint text-pending"
        }`}
      >
        <span className="number shrink-0 font-semibold">
          {formatClock(minutesToTime(from))} to {formatClock(minutesToTime(to))}
        </span>
        <span>{answer.text}</span>
      </p>
    </div>
  );
}
