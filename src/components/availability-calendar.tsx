"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";
import { getSupabase } from "@/lib/supabase";
import { formatClock } from "@/lib/time";
import type { Amenity, TakenRange } from "@/lib/types";

// The availability calendar (FR-09). It shows, for one amenity, the hours that
// are taken: approved bookings, requests waiting for approval, and dates the
// HOA blocked. No names are shown; the data comes from the "availability" view.
//
// Times: the calendar is told to treat every time as plain clock time, and we
// hand it Philippine clock times. That way it looks the same on any device,
// whatever time zone the device is set to.

const OFFSET_MS = 8 * 60 * 60 * 1000;

// A real moment becomes Philippine clock time written as if it were UTC.
function toManilaClock(value: string | Date) {
  return new Date(new Date(value).getTime() + OFFSET_MS).toISOString().slice(0, 19);
}

// And back: a clock time from the calendar becomes the real moment.
function fromManilaClock(value: Date) {
  return new Date(value.getTime() - OFFSET_MS).toISOString();
}

const eventLooks: Record<TakenRange["kind"], { title: string; color: string }> = {
  approved: { title: "Approved", color: "#17553c" },
  pending: { title: "Waiting for approval", color: "#a36400" },
  blocked: { title: "Blocked by the HOA", color: "#55625a" },
};

export default function AvailabilityCalendar({
  amenities,
  canBook,
}: {
  amenities: Amenity[];
  canBook: boolean;
}) {
  const router = useRouter();
  const [amenityId, setAmenityId] = useState(amenities[0]?.amenity_id);
  const [loadError, setLoadError] = useState(false);
  const amenity = amenities.find((item) => item.amenity_id === amenityId);

  // A phone shows one day at a time; a wider screen shows the week.
  const startView = useMemo(
    () => (typeof window !== "undefined" && window.innerWidth < 768 ? "timeGridDay" : "timeGridWeek"),
    [],
  );

  if (!amenity) {
    return <p className="notice notice-info">No amenity is open for booking yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="label max-w-sm">
        Amenity
        <select
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
          Open {formatClock(amenity.open_time)} to {formatClock(amenity.close_time)}
          {amenity.buffer_minutes > 0 && `, with ${amenity.buffer_minutes} minutes kept free after each booking`}
          .{canBook && " Tap a free time to start a request."}
        </span>
      </label>

      {loadError && (
        <p role="alert" className="notice notice-error">
          The schedule could not be loaded. Check your internet and reload the page.
        </p>
      )}

      <div className="calendar-frame rounded-xl border border-line bg-surface p-2 sm:p-3">
        <FullCalendar
          // A new key redraws the calendar when another amenity is chosen.
          key={amenity.amenity_id}
          plugins={[classicThemePlugin, dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={startView}
          timeZone="UTC"
          now={() => toManilaClock(new Date())}
          headerToolbar={{ left: "prev,next today", center: "title", right: "timeGridDay,timeGridWeek,dayGridMonth" }}
          allDaySlot={false}
          slotMinTime={amenity.open_time}
          slotMaxTime={amenity.close_time}
          slotDuration="00:30:00"
          expandRows
          height="auto"
          firstDay={1}
          dayMaxEvents={3}
          events={async (range: { start: Date; end: Date }) => {
            const { data, error } = await getSupabase()
              .from("availability")
              .select("amenity_id, start_at, end_at, kind")
              .eq("amenity_id", amenity.amenity_id)
              .lt("start_at", fromManilaClock(range.end))
              .gt("end_at", fromManilaClock(range.start));
            setLoadError(Boolean(error));
            return ((data ?? []) as TakenRange[]).map((taken) => ({
              title: eventLooks[taken.kind].title,
              start: toManilaClock(taken.start_at),
              end: toManilaClock(taken.end_at),
              color: eventLooks[taken.kind].color,
            }));
          }}
          dateClick={(click) => {
            if (!canBook) return;
            const clock = click.date.toISOString();
            const date = clock.slice(0, 10);
            // A tap on a month cell has no time; the form then starts at opening time.
            const time = click.view.type === "dayGridMonth" ? "" : clock.slice(11, 16);
            router.push(`/book?amenity=${amenity.amenity_id}&date=${date}${time ? `&start=${time}` : ""}`);
          }}
        />
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
        {Object.values(eventLooks).map((look) => (
          <li key={look.title} className="flex items-center gap-1.5">
            <span className="inline-block size-3.5 rounded-sm" style={{ background: look.color }} />
            {look.title}
          </li>
        ))}
        <li>A taken block includes its buffer time.</li>
      </ul>
    </div>
  );
}
