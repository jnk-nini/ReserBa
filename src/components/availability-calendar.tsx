"use client";

import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";
import DaySchedule from "@/components/day-schedule";
import { formatClock } from "@/lib/time";
import type { Amenity } from "@/lib/types";

// The availability calendar (FR-09). It shows, for one amenity, the hours that
// are taken: approved bookings, requests waiting for approval, and dates the
// HOA blocked. No names are shown; the data comes from the "availability" view.
// A phone gets one day at a time. A computer gets the week and month calendar,
// which is downloaded only there, so a phone does not wait for it.

const WeekCalendar = dynamic(() => import("@/components/week-calendar"), {
  ssr: false,
  loading: () => <div className="skeleton h-[36rem] w-full rounded-2xl" />,
});

const legend = [
  { title: "Approved", fill: "bg-approved" },
  { title: "Waiting for approval", fill: "bg-pending-fill" },
  { title: "Blocked by the HOA", fill: "bg-closed" },
];

// True on a screen at least as wide as a small laptop.
const wideScreen = "(min-width: 64rem)";
function useWideScreen() {
  return useSyncExternalStore(
    (changed) => {
      const query = window.matchMedia(wideScreen);
      query.addEventListener("change", changed);
      return () => query.removeEventListener("change", changed);
    },
    () => window.matchMedia(wideScreen).matches,
    () => false,
  );
}

export default function AvailabilityCalendar({ amenities, canBook }: { amenities: Amenity[]; canBook: boolean }) {
  const wide = useWideScreen();
  const [amenityId, setAmenityId] = useState(amenities[0]?.amenity_id);
  const [loadError, setLoadError] = useState(false);
  const amenity = amenities.find((item) => item.amenity_id === amenityId);

  if (!amenity) {
    return <p className="notice notice-info">No amenity is open for booking yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div
          role="group"
          aria-label="Amenity"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {amenities.map((item) => (
            <button
              key={item.amenity_id}
              type="button"
              onClick={() => setAmenityId(item.amenity_id)}
              aria-pressed={item.amenity_id === amenityId}
              className="chip shrink-0"
            >
              {item.name}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[0.8125rem] text-ink-soft">
          Open {formatClock(amenity.open_time)} to {formatClock(amenity.close_time)}
          {amenity.buffer_minutes > 0 && `, with ${amenity.buffer_minutes} minutes kept free after each booking`}.
          {canBook && " Tap a free time to start a request."}
        </p>
      </div>

      {/* A phone gets one day at a time; a computer gets the week and month calendar. */}
      {!wide && (
        <div className="lg:hidden">
          <DaySchedule amenity={amenity} canBook={canBook} />
        </div>
      )}

      {loadError && (
        <p role="alert" className="notice notice-error">
          The schedule could not be loaded. Check your internet and reload the page.
        </p>
      )}

      {wide && <WeekCalendar amenity={amenity} canBook={canBook} onLoadError={setLoadError} />}

      <ul className="hidden flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft lg:flex">
        {legend.map((look) => (
          <li key={look.title} className="flex items-center gap-1.5">
            <span className={`inline-block size-3.5 rounded-sm ${look.fill}`} />
            {look.title}
          </li>
        ))}
        <li>A taken block includes its buffer time.</li>
      </ul>
    </div>
  );
}
