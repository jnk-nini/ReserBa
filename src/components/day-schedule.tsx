"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DayStrip, { StripLegend, type StripSegment } from "@/components/day-strip";
import Icon from "@/components/icon";
import StatusBadge from "@/components/status-badge";
import { getSupabase } from "@/lib/supabase";
import {
  addDays,
  formatClock,
  formatDate,
  manilaDate,
  manilaMinutes,
  manilaToIso,
  minutesToTime,
  timeToMinutes,
  todayInManila,
} from "@/lib/time";
import type { Amenity, TakenRange } from "@/lib/types";

// The availability calendar for a phone (FR-09). A week of calendar columns is
// too small to read at 375 pixels, so on a phone a person taps a day and sees
// that one day as a strip, a list of the free windows (each one opens the
// booking form at that time), and a list of what is already taken. No names
// are shown; the data comes from the "availability" view, like the calendar.

function dayParts(date: string) {
  const moment = new Date(`${date}T00:00:00Z`);
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-PH", { timeZone: "UTC", ...options }).format(moment);
  return { weekday: format({ weekday: "short" }), day: moment.getUTCDate(), month: format({ month: "short" }) };
}

function hoursLabel(minutes: number) {
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} hr` : `${hours.toFixed(1)} hr`;
}

type Range = { from: number; to: number; kind: TakenRange["kind"] };

export default function DaySchedule({ amenity, canBook }: { amenity: Amenity; canBook: boolean }) {
  const today = todayInManila();
  const [date, setDate] = useState(today);
  // Which day and amenity the loaded ranges belong to, so a stale answer is never shown.
  const [loaded, setLoaded] = useState<{ key: string; ranges: TakenRange[]; failed: boolean } | null>(null);
  const key = `${amenity.amenity_id}|${date}`;

  useEffect(() => {
    let current = true;
    getSupabase()
      .from("availability")
      .select("amenity_id, start_at, end_at, kind")
      .eq("amenity_id", amenity.amenity_id)
      .lt("start_at", manilaToIso(addDays(date, 1), "00:00"))
      .gt("end_at", manilaToIso(date, "00:00"))
      .then(({ data, error }) => {
        if (current) setLoaded({ key, ranges: (data ?? []) as TakenRange[], failed: Boolean(error) });
      });
    return () => {
      current = false;
    };
  }, [amenity.amenity_id, date, key]);

  const answer = loaded?.key === key ? loaded : null;
  const ready = answer !== null;
  const openMinutes = timeToMinutes(amenity.open_time);
  const closeMinutes = timeToMinutes(amenity.close_time);

  const taken: Range[] = (answer?.ranges ?? [])
    .map((range) => ({
      kind: range.kind,
      from: manilaDate(range.start_at) < date ? 0 : manilaMinutes(range.start_at),
      to: manilaDate(range.end_at) > date ? 24 * 60 : manilaMinutes(range.end_at),
    }))
    .sort((a, b) => a.from - b.from);

  // The free windows: from opening (or from now, rounded up to the half hour,
  // when the day is today) to closing, minus every taken range.
  const now = new Date();
  const earliest =
    date === today ? Math.max(openMinutes, Math.ceil((manilaMinutes(now) + 1) / 30) * 30) : openMinutes;
  const free: Array<{ from: number; to: number }> = [];
  let cursor = earliest;
  for (const range of taken) {
    if (range.from > cursor) free.push({ from: cursor, to: Math.min(range.from, closeMinutes) });
    cursor = Math.max(cursor, range.to);
  }
  if (cursor < closeMinutes) free.push({ from: cursor, to: closeMinutes });
  const windows = free.filter((window) => window.to - window.from >= 30);

  const segments: StripSegment[] = taken.map((range) => ({ ...range }));
  const days = Array.from({ length: 14 }, (_, index) => addDays(today, index));

  return (
    <div className="flex flex-col gap-5">
      <div
        role="group"
        aria-label="Day"
        className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
      >
        {days.map((day) => {
          const parts = dayParts(day);
          const selected = day === date;
          return (
            <button
              key={day}
              type="button"
              aria-pressed={selected}
              aria-label={formatDate(manilaToIso(day, "12:00"))}
              onClick={() => setDate(day)}
              className={`flex min-h-[4.25rem] w-14 shrink-0 snap-start cursor-pointer flex-col items-center justify-center rounded-xl border transition-[background-color,border-color,transform] duration-150 active:scale-[0.97] ${
                selected ? "border-brand bg-brand text-on-brand" : "border-line-strong bg-surface"
              }`}
            >
              <span className={`text-xs font-medium ${selected ? "text-on-brand/80" : "text-ink-soft"}`}>
                {day === today ? "Today" : parts.weekday}
              </span>
              <span className="number text-xl leading-tight font-semibold">{parts.day}</span>
              <span className={`text-[0.6875rem] ${selected ? "text-on-brand/80" : "text-ink-soft"}`}>{parts.month}</span>
            </button>
          );
        })}
      </div>

      {answer?.failed && (
        <p role="alert" className="notice notice-error">
          The schedule could not be loaded. Check your internet and reload the page.
        </p>
      )}

      <section className="panel flex flex-col gap-3">
        <h2 className="text-base font-semibold">
          {amenity.name}, {formatDate(manilaToIso(date, "12:00"))}
        </h2>
        <DayStrip openMinutes={openMinutes} closeMinutes={closeMinutes} segments={segments} />
        <StripLegend />
        {amenity.buffer_minutes > 0 && (
          <p className="text-[0.8125rem] text-ink-soft">
            {amenity.buffer_minutes} minutes stay free after each booking. A taken block includes them.
          </p>
        )}
      </section>

      <section aria-busy={!ready}>
        <h2 className="eyebrow mb-2">Free times</h2>
        {!ready ? (
          <div className="skeleton h-16 w-full" />
        ) : windows.length === 0 ? (
          <p className="panel text-[0.9375rem] text-ink-soft">Nothing is free on this day. Try another day.</p>
        ) : (
          <ul className="list-card">
            {windows.map((window) => {
              const content = (
                <>
                  <span className="min-w-0">
                    <span className="number block text-base font-semibold">
                      {formatClock(minutesToTime(window.from))} to {formatClock(minutesToTime(window.to))}
                    </span>
                    <span className="block text-[0.8125rem] text-ink-soft">{hoursLabel(window.to - window.from)} free</span>
                  </span>
                  {canBook && (
                    <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand">
                      Book
                      <Icon name="chevron-right" className="size-4" />
                    </span>
                  )}
                </>
              );
              return (
                <li key={window.from}>
                  {canBook ? (
                    <Link
                      href={`/book?amenity=${amenity.amenity_id}&date=${date}&start=${minutesToTime(window.from)}`}
                      className="row-link justify-between"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between gap-4 px-4 py-4">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {ready && taken.length > 0 && (
        <section>
          <h2 className="eyebrow mb-2">Already taken</h2>
          <ul className="list-card">
            {taken.map((range, index) => (
              <li key={index} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <span className="number text-[0.9375rem]">
                  {formatClock(minutesToTime(range.from))} to {formatClock(minutesToTime(Math.min(range.to, 24 * 60 - 1)))}
                </span>
                {range.kind === "blocked" ? (
                  <span className="badge bg-closed-tint text-closed">Blocked by the HOA</span>
                ) : (
                  <StatusBadge status={range.kind} />
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
