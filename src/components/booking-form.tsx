"use client";

import { useEffect, useState } from "react";
import ActionForm from "@/components/action-form";
import DayStrip, { StripLegend, type StripSegment } from "@/components/day-strip";
import Icon from "@/components/icon";
import { submitReservation } from "@/app/(app)/book/actions";
import { formatMoney, previewFee } from "@/lib/money";
import { getSupabase } from "@/lib/supabase";
import {
  addDays,
  formatClock,
  formatDate,
  isPast,
  manilaDate,
  manilaMinutes,
  manilaToIso,
  minutesToTime,
  timeToMinutes,
  todayInManila,
} from "@/lib/time";
import type { Amenity, Equipment, TakenRange } from "@/lib/types";

// The booking form (FR-10, FR-11, FR-14). A person taps an amenity, a day, a
// start time and a length, instead of opening four drop-down lists. Times that
// cannot be booked are greyed out before they are tapped, a strip shows the day
// at a glance, and the fee is previewed. These are only helpers: when the form
// is sent, the database checks everything again and computes the fee that is
// saved. The fields sent are the same as before: amenity_id, date, start, end,
// equipment_<id>, and for walk-ins guest_name and sponsor_id.

type Sponsor = { user_id: string; full_name: string };

type Props = {
  amenities: Amenity[];
  equipment: Equipment[];
  // Walk-in mode for administrators: adds the guest name and sponsor fields.
  walkIn?: boolean;
  sponsors?: Sponsor[];
  initial?: { amenityId?: number; date?: string; start?: string };
};

// The lengths offered, in minutes.
const lengths = [30, 60, 90, 120, 180, 240, 360];

function lengthLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hr`;
}

function dayParts(date: string) {
  const moment = new Date(`${date}T00:00:00Z`);
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-PH", { timeZone: "UTC", ...options }).format(moment);
  return { weekday: format({ weekday: "short" }), day: moment.getUTCDate(), month: format({ month: "short" }) };
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="panel flex flex-col gap-4">
      <h2 className="flex items-center gap-2.5 text-base font-semibold">
        <span className="number flex size-6 items-center justify-center rounded-full bg-ink text-xs font-semibold text-surface">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function BookingForm({ amenities, equipment, walkIn = false, sponsors = [], initial = {} }: Props) {
  const today = todayInManila();
  const firstAmenity = amenities.find((item) => item.amenity_id === initial.amenityId) ?? amenities[0];
  const [amenityId, setAmenityId] = useState(firstAmenity.amenity_id);
  // With no day asked for, start on today, or on tomorrow when today is over.
  const [date, setDate] = useState(() => {
    if (initial.date && initial.date >= today) return initial.date;
    const closed = manilaMinutes(new Date()) >= timeToMinutes(firstAmenity.close_time) - 30;
    return closed ? addDays(today, 1) : today;
  });
  const amenity = amenities.find((item) => item.amenity_id === amenityId) ?? firstAmenity;
  const openMinutes = timeToMinutes(amenity.open_time);
  const closeMinutes = timeToMinutes(amenity.close_time);

  // The start (minutes since midnight) and the length. Until the person taps a
  // time, the first free time of the day is shown as the choice.
  const [pickedStart, setPickedStart] = useState<number | null>(initial.start ? timeToMinutes(initial.start) : null);
  const [length, setLength] = useState(60);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [guestName, setGuestName] = useState("");
  const [taken, setTaken] = useState<TakenRange[]>([]);

  // Load what is already taken on that day for that amenity.
  useEffect(() => {
    let current = true;
    getSupabase()
      .from("availability")
      .select("amenity_id, start_at, end_at, kind")
      .eq("amenity_id", amenityId)
      .lt("start_at", manilaToIso(addDays(date, 1), "00:00"))
      .gt("end_at", manilaToIso(date, "00:00"))
      .then(({ data }) => {
        if (current) setTaken((data ?? []) as TakenRange[]);
      });
    return () => {
      current = false;
    };
  }, [amenityId, date]);

  // Taken ranges as minutes of this day (a range may start or end on another day).
  const takenToday = taken.map((range) => ({
    kind: range.kind,
    from: manilaDate(range.start_at) < date ? 0 : manilaMinutes(range.start_at),
    to: manilaDate(range.end_at) > date ? 24 * 60 : manilaMinutes(range.end_at),
  }));

  // The same test the database applies: my time plus my buffer must not touch
  // a taken range (a booking's range already includes its own buffer).
  function problem(start: number, minutes: number) {
    const end = start + minutes;
    if (end > closeMinutes) return "closed" as const;
    if (isPast(manilaToIso(date, minutesToTime(start)))) return "past" as const;
    const clash = takenToday.find((range) => start < range.to && range.from < end + amenity.buffer_minutes);
    if (clash) return clash.kind === "blocked" ? ("blocked" as const) : ("taken" as const);
    return null;
  }

  const startOptions: number[] = [];
  for (let minute = openMinutes; minute <= closeMinutes - 30; minute += 30) startOptions.push(minute);

  const firstFree = startOptions.find((minute) => problem(minute, length) === null);
  const start = Math.min(Math.max(pickedStart ?? firstFree ?? openMinutes, openMinutes), closeMinutes - 30);
  const end = Math.min(start + length, closeMinutes);
  const minutes = end - start;
  const issue = problem(start, minutes);
  const occupiedUntil = end + amenity.buffer_minutes;

  let warning: string | null = null;
  if (issue === "past") warning = "That start time has already passed.";
  else if (issue === "closed") warning = `${amenity.name} closes at ${formatClock(amenity.close_time)}. Pick an earlier start or a shorter time.`;
  else if (issue === "blocked") warning = "The HOA has blocked part of that time. Please pick another time.";
  else if (issue === "taken")
    warning =
      amenity.buffer_minutes > 0
        ? `That time is too close to another reservation. ${amenity.buffer_minutes} minutes must stay free between bookings.`
        : "That time overlaps another reservation. Please pick another time.";

  const segments: StripSegment[] = [
    ...takenToday.map((range) => ({ ...range, kind: range.kind as StripSegment["kind"] })),
    ...(amenity.buffer_minutes > 0 ? [{ from: end, to: occupiedUntil, kind: "buffer" as const }] : []),
    { from: start, to: end, kind: issue ? ("clash" as const) : ("choice" as const) },
  ];

  // Fee preview.
  const isGuest = walkIn && guestName.trim() !== "";
  const hourlyRate = isGuest ? amenity.rate_nonresident : amenity.rate_resident;
  const equipmentLines = equipment
    .map((item) => ({ item, quantity: quantities[item.equipment_id] ?? 0 }))
    .filter((line) => line.quantity > 0);
  const equipmentTotal = equipmentLines.reduce((sum, line) => sum + line.quantity * Number(line.item.rate), 0);
  const fee = previewFee(minutes, hourlyRate, equipmentTotal);

  const days = Array.from({ length: 14 }, (_, index) => addDays(today, index));
  const chosen = dayParts(date);

  return (
    <ActionForm
      action={submitReservation}
      submitLabel={walkIn ? "Save the reservation" : "Send the request"}
      pendingLabel="Checking and saving..."
      className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start"
      disabled={Boolean(issue)}
      buttonClass="btn btn-primary btn-large flex-1 lg:w-full lg:flex-none"
      barClass="sticky bottom-[calc(3.5rem+1px+env(safe-area-inset-bottom))] z-10 -mx-4 flex items-center gap-4 border-t border-line bg-surface/95 px-4 py-3 shadow-high backdrop-blur-xl sm:-mx-6 sm:px-6 lg:static lg:col-start-1 lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none"
      bar={
        <p className="number text-sm leading-tight lg:hidden">
          <span className="block text-ink-soft">Total fee</span>
          <span className="text-xl font-semibold">{formatMoney(fee)}</span>
        </p>
      }
    >
      <div className="flex min-w-0 flex-col gap-5">
        {walkIn && (
          <fieldset className="panel flex flex-col gap-4">
            <legend className="sr-only">Who is it for?</legend>
            <h2 className="text-base font-semibold">Who is it for?</h2>
            <label className="label">
              Guest name
              <input
                name="guest_name"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                className="input"
                placeholder="Leave empty when a resident is booking for themselves"
              />
              <span className="hint">A guest (non-resident) pays the non-resident rate.</span>
            </label>
            <label className="label">
              Resident (sponsor)
              <select name="sponsor_id" defaultValue="" className="input">
                <option value="">No resident (walk-in guest)</option>
                {sponsors.map((sponsor) => (
                  <option key={sponsor.user_id} value={sponsor.user_id}>
                    {sponsor.full_name}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>
        )}

        <Step number={1} title="Choose an amenity">
          <div role="radiogroup" aria-label="Amenity" className="grid gap-2.5 sm:grid-cols-2">
            {amenities.map((item) => {
              const selected = item.amenity_id === amenityId;
              return (
                <label key={item.amenity_id} className="relative block cursor-pointer">
                  <input
                    type="radio"
                    name="amenity_id"
                    value={item.amenity_id}
                    checked={selected}
                    onChange={() => setAmenityId(item.amenity_id)}
                    className="peer sr-only"
                  />
                  <span
                    className={`flex min-h-[4.25rem] items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-[border-color,box-shadow,background-color] duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand ${
                      selected
                        ? "border-brand bg-brand-tint/50 ring-1 ring-brand"
                        : "border-line-strong bg-surface hover:border-ink-soft/60"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-base font-semibold">{item.name}</span>
                      <span className="number block text-[0.8125rem] text-ink-soft">
                        {formatClock(item.open_time)} to {formatClock(item.close_time)}
                      </span>
                    </span>
                    <span className="number shrink-0 text-right text-sm">
                      <span className="font-semibold">{formatMoney(item.rate_resident)}</span>
                      <span className="text-ink-soft"> / hr</span>
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </Step>

        <Step number={2} title="Pick a day and a time">
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="start" value={minutesToTime(start)} />
          <input type="hidden" name="end" value={minutesToTime(end)} />

          <div>
            <p className="mb-2 text-sm font-medium">Day</p>
            <div
              role="group"
              aria-label="Day"
              className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0"
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
                      selected
                        ? "border-brand bg-brand text-on-brand"
                        : "border-line-strong bg-surface hover:border-ink-soft/60"
                    }`}
                  >
                    <span className={`text-xs font-medium ${selected ? "text-on-brand/80" : "text-ink-soft"}`}>
                      {day === today ? "Today" : parts.weekday}
                    </span>
                    <span className="number text-xl leading-tight font-semibold">{parts.day}</span>
                    <span className={`text-[0.6875rem] ${selected ? "text-on-brand/80" : "text-ink-soft"}`}>
                      {parts.month}
                    </span>
                  </button>
                );
              })}
            </div>
            <label className="mt-3 flex items-center gap-3 text-sm text-ink-soft">
              Another day
              <input
                type="date"
                min={today}
                value={date}
                onChange={(event) => event.target.value && setDate(event.target.value)}
                className="input w-auto"
                aria-label="Another day"
              />
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">How long</p>
            <div role="group" aria-label="How long" className="flex flex-wrap gap-2">
              {lengths.map((value) => (
                <button
                  key={value}
                  type="button"
                  className="chip number"
                  aria-pressed={value === length}
                  onClick={() => setLength(value)}
                >
                  {lengthLabel(value)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Start time</p>
            <div role="group" aria-label="Start time" className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
              {startOptions.map((minute) => {
                const blocked = problem(minute, length) !== null;
                return (
                  <button
                    key={minute}
                    type="button"
                    className="chip number px-2"
                    aria-pressed={!blocked && minute === start}
                    disabled={blocked}
                    onClick={() => setPickedStart(minute)}
                  >
                    {formatClock(minutesToTime(minute))}
                  </button>
                );
              })}
            </div>
            {!firstFree && (
              <p className="mt-3 text-sm text-ink-soft">
                Nothing is free for {lengthLabel(length)} on this day. Try a shorter time or another day.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">The day at a glance</p>
            <DayStrip openMinutes={openMinutes} closeMinutes={closeMinutes} segments={segments} />
            <StripLegend showChoice />
          </div>

          {warning && (
            <p role="alert" className="notice notice-error">
              {warning}
            </p>
          )}
        </Step>

        {equipment.length > 0 && (
          <Step number={3} title="Equipment to borrow (optional)">
            <ul className="flex flex-col divide-y divide-line">
              {equipment.map((item) => {
                const quantity = quantities[item.equipment_id] ?? 0;
                const set = (next: number) =>
                  setQuantities({
                    ...quantities,
                    [item.equipment_id]: Math.min(item.total_quantity, Math.max(0, next)),
                  });
                return (
                  <li key={item.equipment_id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="min-w-0">
                      <span className="block text-base font-medium">{item.name}</span>
                      <span className="number block text-[0.8125rem] text-ink-soft">
                        {formatMoney(item.rate)} each, {item.total_quantity} available
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <input type="hidden" name={`equipment_${item.equipment_id}`} value={quantity} />
                      <button
                        type="button"
                        aria-label={`One less ${item.name}`}
                        disabled={quantity === 0}
                        onClick={() => set(quantity - 1)}
                        className="chip size-11 px-0 text-lg"
                      >
                        &minus;
                      </button>
                      <span className="number w-9 text-center text-base font-semibold" aria-live="polite">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`One more ${item.name}`}
                        disabled={quantity >= item.total_quantity}
                        onClick={() => set(quantity + 1)}
                        className="chip size-11 px-0 text-lg"
                      >
                        <Icon name="plus" className="size-4" />
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Step>
        )}
      </div>

      <aside className="panel lg:sticky lg:top-8 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <h2 className="text-base font-semibold">Summary</h2>
        <div className="mt-4 flex flex-col gap-1 rounded-xl bg-ground p-4">
          <p className="text-base font-semibold">{amenity.name}</p>
          <p className="number text-sm text-ink-soft">
            {chosen.weekday}, {chosen.month} {chosen.day}
          </p>
          <p className="number flex items-center gap-1.5 text-sm text-ink-soft">
            <Icon name="clock" className="size-4" />
            {issue === "closed" ? "No time chosen" : `${formatClock(minutesToTime(start))} to ${formatClock(minutesToTime(end))}`}
            <span aria-hidden="true">·</span>
            {lengthLabel(minutes)}
          </p>
        </div>
        <dl className="number mt-4 flex flex-col gap-2 text-[0.9375rem]">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-soft">
              {lengthLabel(minutes)} at {formatMoney(hourlyRate)}
              {isGuest && " (non-resident)"}
            </dt>
            <dd>{formatMoney(fee - equipmentTotal)}</dd>
          </div>
          {equipmentLines.map((line) => (
            <div key={line.item.equipment_id} className="flex justify-between gap-3">
              <dt className="text-ink-soft">
                {line.item.name} &times; {line.quantity}
              </dt>
              <dd>{formatMoney(line.quantity * Number(line.item.rate))}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-3 border-t border-line pt-3 text-base font-semibold">
            <dt>Fee</dt>
            <dd>{formatMoney(fee)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-soft">Security deposit</dt>
            <dd>{formatMoney(amenity.deposit)}</dd>
          </div>
        </dl>
        <p className="mt-4 flex gap-2 text-[0.8125rem] text-ink-soft">
          <Icon name="shield" className="mt-0.5 size-4" />
          <span>
            The request is saved as waiting for approval. Payment is made to the HOA in cash or by e-wallet, outside
            this system.
          </span>
        </p>
      </aside>
    </ActionForm>
  );
}
