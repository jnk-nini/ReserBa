"use client";

import { useEffect, useState } from "react";
import ActionForm from "@/components/action-form";
import DayStrip, { StripLegend, type StripSegment } from "@/components/day-strip";
import { submitReservation } from "@/app/(app)/book/actions";
import { formatMoney, previewFee } from "@/lib/money";
import { getSupabase } from "@/lib/supabase";
import {
  addDays,
  formatClock,
  isPast,
  manilaDate,
  manilaMinutes,
  manilaToIso,
  minutesToTime,
  timeToMinutes,
  todayInManila,
} from "@/lib/time";
import type { Amenity, Equipment, TakenRange } from "@/lib/types";

// The booking form (FR-10, FR-11, FR-14). While the person chooses a time it
// draws the day strip with what is already taken, warns about an overlap, and
// previews the fee. These are only helpers: when the form is sent, the database
// checks everything again and computes the fee that is saved.

type Sponsor = { user_id: string; full_name: string };

type Props = {
  amenities: Amenity[];
  equipment: Equipment[];
  // Walk-in mode for administrators: adds the guest name and sponsor fields.
  walkIn?: boolean;
  sponsors?: Sponsor[];
  initial?: { amenityId?: number; date?: string; start?: string };
};

export default function BookingForm({ amenities, equipment, walkIn = false, sponsors = [], initial = {} }: Props) {
  const today = todayInManila();
  const firstAmenity = amenities.find((item) => item.amenity_id === initial.amenityId) ?? amenities[0];
  const [amenityId, setAmenityId] = useState(firstAmenity.amenity_id);
  const [date, setDate] = useState(initial.date && initial.date >= today ? initial.date : today);
  const amenity = amenities.find((item) => item.amenity_id === amenityId) ?? firstAmenity;
  const openMinutes = timeToMinutes(amenity.open_time);
  const closeMinutes = timeToMinutes(amenity.close_time);

  // Start and end are kept as minutes since midnight.
  const initialStart = initial.start ? timeToMinutes(initial.start) : openMinutes;
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialStart + 60);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [guestName, setGuestName] = useState("");
  const [taken, setTaken] = useState<TakenRange[]>([]);

  // Keep the chosen times inside the operating hours of the chosen amenity.
  const safeStart = Math.min(Math.max(start, openMinutes), closeMinutes - 30);
  const safeEnd = Math.min(Math.max(end, safeStart + 30), closeMinutes);

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
  const occupiedUntil = safeEnd + amenity.buffer_minutes;
  const overlap = takenToday.find((range) => safeStart < range.to && range.from < occupiedUntil);
  const inPast = isPast(manilaToIso(date, minutesToTime(safeStart)));

  let warning: string | null = null;
  if (inPast) {
    warning = "That start time has already passed.";
  } else if (overlap?.kind === "blocked") {
    warning = "The HOA has blocked part of that time. Please pick another time.";
  } else if (overlap) {
    warning =
      amenity.buffer_minutes > 0
        ? `That time is too close to another reservation. ${amenity.buffer_minutes} minutes must stay free between bookings.`
        : "That time overlaps another reservation. Please pick another time.";
  }

  const segments: StripSegment[] = [
    ...takenToday.map((range) => ({ ...range, kind: range.kind as StripSegment["kind"] })),
    { from: safeEnd, to: occupiedUntil, kind: "buffer" },
    { from: safeStart, to: safeEnd, kind: "choice" },
  ];

  // Fee preview.
  const isGuest = walkIn && guestName.trim() !== "";
  const hourlyRate = isGuest ? amenity.rate_nonresident : amenity.rate_resident;
  const equipmentLines = equipment
    .map((item) => ({ item, quantity: quantities[item.equipment_id] ?? 0 }))
    .filter((line) => line.quantity > 0);
  const equipmentTotal = equipmentLines.reduce((sum, line) => sum + line.quantity * Number(line.item.rate), 0);
  const minutes = safeEnd - safeStart;
  const fee = previewFee(minutes, hourlyRate, equipmentTotal);

  const startOptions: number[] = [];
  for (let minute = openMinutes; minute <= closeMinutes - 30; minute += 30) startOptions.push(minute);
  const endOptions: number[] = [];
  for (let minute = safeStart + 30; minute <= closeMinutes; minute += 30) endOptions.push(minute);

  return (
    <ActionForm
      action={submitReservation}
      submitLabel={walkIn ? "Save the reservation" : "Send the request"}
      pendingLabel="Checking and saving..."
      className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start"
      buttonClass="btn btn-primary lg:col-start-1"
    >
      <div className="flex flex-col gap-4">
        {walkIn && (
          <fieldset className="panel flex flex-col gap-4">
            <legend className="px-1 text-base font-bold">Who is it for?</legend>
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

        <label className="label">
          Amenity
          <select
            name="amenity_id"
            className="input"
            value={amenityId}
            onChange={(event) => setAmenityId(Number(event.target.value))}
          >
            {amenities.map((item) => (
              <option key={item.amenity_id} value={item.amenity_id}>
                {item.name}
              </option>
            ))}
          </select>
          <span className="hint">
            Open {formatClock(amenity.open_time)} to {formatClock(amenity.close_time)}.
          </span>
        </label>

        <label className="label">
          Date
          <input
            name="date"
            type="date"
            required
            min={today}
            value={date}
            onChange={(event) => event.target.value && setDate(event.target.value)}
            className="input"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="label">
            From
            <select
              name="start"
              className="input"
              value={minutesToTime(safeStart)}
              onChange={(event) => {
                const next = timeToMinutes(event.target.value);
                // Moving the start keeps the same length of time.
                setEnd(next + (safeEnd - safeStart));
                setStart(next);
              }}
            >
              {startOptions.map((minute) => (
                <option key={minute} value={minutesToTime(minute)}>
                  {formatClock(minutesToTime(minute))}
                </option>
              ))}
            </select>
          </label>
          <label className="label">
            To
            <select
              name="end"
              className="input"
              value={minutesToTime(safeEnd)}
              onChange={(event) => setEnd(timeToMinutes(event.target.value))}
            >
              {endOptions.map((minute) => (
                <option key={minute} value={minutesToTime(minute)}>
                  {formatClock(minutesToTime(minute))}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">That day at {amenity.name}</p>
          <DayStrip openMinutes={openMinutes} closeMinutes={closeMinutes} segments={segments} />
          <StripLegend showChoice />
        </div>

        {warning && (
          <p role="alert" className="notice notice-error">
            {warning}
          </p>
        )}

        {equipment.length > 0 && (
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-semibold">Equipment to borrow (optional)</legend>
            {equipment.map((item) => (
              <label key={item.equipment_id} className="flex items-center justify-between gap-3 text-base">
                <span>
                  {item.name}
                  <span className="block text-sm text-ink-soft">
                    {formatMoney(item.rate)} each, {item.total_quantity} owned
                  </span>
                </span>
                <input
                  name={`equipment_${item.equipment_id}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={item.total_quantity}
                  value={quantities[item.equipment_id] ?? 0}
                  onChange={(event) =>
                    setQuantities({ ...quantities, [item.equipment_id]: Math.max(0, Number(event.target.value)) })
                  }
                  className="input number w-24 text-right"
                  aria-label={`Number of ${item.name}`}
                />
              </label>
            ))}
          </fieldset>
        )}
      </div>

      <aside className="panel lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <h2 className="text-lg font-bold">Fee summary</h2>
        <dl className="number mt-3 flex flex-col gap-2 text-base">
          <div className="flex justify-between gap-3">
            <dt>
              {amenity.name}, {minutes / 60} {minutes === 60 ? "hour" : "hours"} at {formatMoney(hourlyRate)}
              {isGuest && " (non-resident)"}
            </dt>
            <dd>{formatMoney(fee - equipmentTotal)}</dd>
          </div>
          {equipmentLines.map((line) => (
            <div key={line.item.equipment_id} className="flex justify-between gap-3">
              <dt>
                {line.item.name} x {line.quantity}
              </dt>
              <dd>{formatMoney(line.quantity * Number(line.item.rate))}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-3 border-t border-line pt-2 font-bold">
            <dt>Fee</dt>
            <dd>{formatMoney(fee)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Security deposit</dt>
            <dd>{formatMoney(amenity.deposit)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-ink-soft">
          The request is saved as waiting for approval. Payment is made to the HOA in cash or by e-wallet,
          outside this system.
        </p>
      </aside>
    </ActionForm>
  );
}
