"use client";

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
import type { Amenity, TakenRange } from "@/lib/types";

// The week and month calendar of a computer screen. It lives in its own file
// because the calendar library is large: a phone, which shows one day at a
// time instead, never downloads it.
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

export const eventLooks: Record<TakenRange["kind"], { title: string; color: string }> = {
  approved: { title: "Approved", color: "#1c6b47" },
  pending: { title: "Waiting for approval", color: "#d39a2c" },
  blocked: { title: "Blocked by the HOA", color: "#5a625c" },
};

export default function WeekCalendar({
  amenity,
  canBook,
  onLoadError,
}: {
  amenity: Amenity;
  canBook: boolean;
  onLoadError: (failed: boolean) => void;
}) {
  const router = useRouter();

  return (
    <div className="calendar-frame rounded-2xl border border-line bg-surface p-4 shadow-low">
      <FullCalendar
        // A new key redraws the calendar when another amenity is chosen.
        key={amenity.amenity_id}
        plugins={[classicThemePlugin, dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
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
          onLoadError(Boolean(error));
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
  );
}
