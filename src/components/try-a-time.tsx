"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import DayStrip, { StripLegend, type StripSegment } from "./day-strip";
import Icon from "./icon";
import { formatMoney, previewFee } from "@/lib/money";
import { formatClock, minutesToTime } from "@/lib/time";

// The box on the first page where a visitor tries a time and sees the answer
// at once. It uses a made-up day, not the real database, so anyone can play
// with it before signing up. The checks are the same ones the real system
// makes: closing time, blocked hours, other bookings, and the buffer after
// each booking.

type Sample = {
  name: string;
  open: number;
  close: number;
  bufferMinutes: number;
  rate: number;
  deposit: number;
  taken: StripSegment[];
};

const samples: Sample[] = [
  {
    name: "Clubhouse",
    open: 480,
    close: 1320,
    bufferMinutes: 60,
    rate: 500,
    deposit: 1000,
    taken: [
      { from: 480, to: 600, kind: "blocked", label: "General cleaning" },
      { from: 780, to: 1020, kind: "approved", label: "Birthday party" },
      { from: 1140, to: 1260, kind: "pending", label: "Waiting for approval" },
    ],
  },
  {
    name: "Basketball court",
    open: 360,
    close: 1320,
    bufferMinutes: 0,
    rate: 100,
    deposit: 0,
    taken: [
      { from: 360, to: 480, kind: "approved", label: "Morning league" },
      { from: 960, to: 1080, kind: "approved", label: "Youth practice" },
      { from: 1080, to: 1200, kind: "pending", label: "Waiting for approval" },
    ],
  },
  {
    name: "Swimming pool",
    open: 480,
    close: 1200,
    bufferMinutes: 30,
    rate: 300,
    deposit: 500,
    taken: [
      { from: 600, to: 720, kind: "approved", label: "Swimming lessons" },
      { from: 900, to: 1020, kind: "blocked", label: "Water treatment" },
    ],
  },
];

const durations = [1, 2, 3, 4];

type Answer = { fits: boolean; title: string; detail: string };

function check(sample: Sample, start: number, hours: number): Answer {
  const end = start + hours * 60;
  const range = `${formatClock(minutesToTime(start))} to ${formatClock(minutesToTime(end))}`;

  if (end > sample.close) {
    return {
      fits: false,
      title: "Past closing time",
      detail: `The ${sample.name.toLowerCase()} closes at ${formatClock(minutesToTime(sample.close))}. Pick an earlier start or fewer hours.`,
    };
  }
  for (const other of sample.taken) {
    if (other.kind === "blocked" && start < other.to && end > other.from) {
      return {
        fits: false,
        title: "Blocked by the HOA",
        detail: `${other.label} runs until ${formatClock(minutesToTime(other.to))}. No one can book over it.`,
      };
    }
  }
  for (const other of sample.taken) {
    if (other.kind === "blocked") continue;
    // Each booking keeps the buffer after it free, for cleaning and turnover.
    const clashes = start < other.to + sample.bufferMinutes && end + sample.bufferMinutes > other.from;
    if (clashes) {
      const overlaps = start < other.to && end > other.from;
      return {
        fits: false,
        title: overlaps ? "That time is taken" : "Too close to another booking",
        detail: overlaps
          ? `It overlaps a booking from ${formatClock(minutesToTime(other.from))} to ${formatClock(minutesToTime(other.to))}. The system will not accept it.`
          : `The ${sample.name.toLowerCase()} keeps ${sample.bufferMinutes} minutes free between bookings. Move it a little.`,
      };
    }
  }
  return {
    fits: true,
    title: "This time is free",
    detail: `${range} fits. You could send this request right now.`,
  };
}

export default function TryATime() {
  const [index, setIndex] = useState(0);
  const [start, setStart] = useState(600);
  const [hours, setHours] = useState(2);

  const sample = samples[index];
  // Keeps the start inside the opening hours when the amenity changes.
  const safeStart = Math.min(Math.max(start, sample.open), sample.close - 60);
  const end = safeStart + hours * 60;
  const answer = check(sample, safeStart, hours);

  const starts: number[] = [];
  for (let minute = sample.open; minute <= sample.close - 60; minute += 60) {
    starts.push(minute);
  }

  const segments: StripSegment[] = [
    ...sample.taken,
    { from: safeStart, to: end, kind: answer.fits ? "choice" : "clash" },
  ];
  if (answer.fits && sample.bufferMinutes > 0) {
    segments.push({ from: end, to: end + sample.bufferMinutes, kind: "buffer" });
  }

  const fee = previewFee(hours * 60, sample.rate, 0);

  return (
    <div className="beam rounded-3xl border border-line bg-surface p-4 text-ink shadow-high sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="text-lg font-bold">Try a time</h2>
        <p className="text-sm text-ink-soft">A sample Saturday. Nothing is saved.</p>
      </div>

      <div
        role="group"
        aria-label="Amenity"
        className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-closed-tint p-1"
      >
        {samples.map((item, itemIndex) => (
          <button
            key={item.name}
            type="button"
            aria-pressed={itemIndex === index}
            onClick={() => setIndex(itemIndex)}
            className={`relative min-h-11 cursor-pointer rounded-lg px-2 py-1.5 text-sm leading-tight font-semibold transition-colors duration-150 sm:text-base ${
              itemIndex === index ? "text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {itemIndex === index && (
              <motion.span
                layoutId="try-amenity"
                className="absolute inset-0 rounded-lg bg-surface shadow-low"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <span className="relative">{item.name}</span>
          </button>
        ))}
      </div>

      <div className="mt-5">
        <DayStrip openMinutes={sample.open} closeMinutes={sample.close} segments={segments} />
        <div className="mt-2">
          <StripLegend showChoice choiceLabel="Your time" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="label">
          Start
          <select
            className="input"
            value={safeStart}
            onChange={(event) => setStart(Number(event.target.value))}
          >
            {starts.map((minute) => (
              <option key={minute} value={minute}>
                {formatClock(minutesToTime(minute))}
              </option>
            ))}
          </select>
        </label>
        <div className="label">
          <span id="try-hours">How long</span>
          <div role="group" aria-labelledby="try-hours" className="grid grid-cols-4 gap-1.5">
            {durations.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={value === hours}
                onClick={() => setHours(value)}
                className={`number min-h-11 cursor-pointer rounded-lg border text-base font-semibold transition-colors duration-150 ${
                  value === hours
                    ? "border-brand bg-brand text-on-brand"
                    : "border-line-strong bg-surface text-ink hover:border-brand hover:bg-brand-tint"
                }`}
              >
                {value} hr
              </button>
            ))}
          </div>
        </div>
      </div>

      <div role="status" className="mt-5 min-h-[5.5rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={answer.title + answer.detail}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className={`flex gap-3 rounded-xl border px-4 py-3 ${
              answer.fits
                ? "border-approved/30 bg-approved-tint text-approved"
                : "border-refused/30 bg-refused-tint text-refused"
            }`}
          >
            <span
              className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-on-brand ${
                answer.fits ? "bg-approved" : "bg-refused"
              }`}
            >
              <Icon name={answer.fits ? "check" : "lock"} className="size-3.5" />
            </span>
            <div>
              <p className="font-bold">{answer.title}</p>
              <p className="text-[0.9375rem]">{answer.detail}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="number mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm text-ink-soft">
        <dl className="flex flex-wrap gap-x-6 gap-y-1">
          <div className="flex gap-1.5">
            <dt>Fee</dt>
            <dd className="font-semibold text-ink">{formatMoney(fee)}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>Deposit</dt>
            <dd className="font-semibold text-ink">{formatMoney(sample.deposit)}</dd>
          </div>
        </dl>
        <p>Sample rates. Each HOA sets its own.</p>
      </div>
    </div>
  );
}
