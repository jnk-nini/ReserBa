import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Icon from "@/components/icon";
import ReservationRow from "@/components/reservation-row";
import StatusBadge from "@/components/status-badge";
import { homePathFor, requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { getServerSupabase } from "@/lib/supabase-server";
import { formatClock, formatDate, formatTime, manilaMinutes } from "@/lib/time";
import type { Amenity, Reservation } from "@/lib/types";

export const metadata: Metadata = {
  title: "Home | ReserBa",
};

type Row = Reservation & { amenities: { name: string } | null; payments: Array<{ status: string }> };

function greeting() {
  const hour = manilaMinutes(new Date()) / 60;
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// The first screen after logging in. Administrators and guards go straight to
// their own first screen. A resident sees what matters today: the next
// reservation, the requests still open, and the amenities that can be booked.
export default async function HomePage() {
  const user = await requireUser();
  if (user.role !== "resident") {
    redirect(homePathFor(user.role));
  }

  const supabase = await getServerSupabase();
  const [reservationResult, amenityResult] = await Promise.all([
    supabase
      .from("reservations")
      .select("*, amenities(name), payments(status)")
      .eq("user_id", user.user_id)
      .in("status", ["pending", "approved"])
      .gt("end_at", new Date().toISOString())
      .order("start_at")
      .limit(4),
    supabase.from("amenities").select("*").eq("is_active", true).order("name"),
  ]);
  const upcoming = (reservationResult.data ?? []) as unknown as Row[];
  const amenities = (amenityResult.data ?? []) as Amenity[];
  const next = upcoming[0];
  const later = upcoming.slice(1);
  const canBook = user.residency_status === "verified";
  const firstName = user.full_name.trim().split(/\s+/)[0];

  return (
    <>
      <header className="mb-6 sm:mb-9">
        <p className="eyebrow">{formatDate(new Date())}</p>
        <h1 className="display mt-2 text-[2rem] sm:text-[2.5rem]">
          {greeting()}, {firstName}.
        </h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10">
        <div className="flex min-w-0 flex-col gap-8">
          <section aria-labelledby="next-title">
            <h2 id="next-title" className="eyebrow mb-3">
              Your next reservation
            </h2>
            {next ? (
              <Link
                href={`/reservations/${next.reservation_id}`}
                className="group block overflow-hidden rounded-2xl bg-brand text-on-brand shadow-high transition-transform duration-200 ease-settle hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4 p-5 sm:p-7">
                  <div className="min-w-0">
                    <p className="display text-[1.75rem] sm:text-[2.125rem]">{next.amenities?.name}</p>
                    <p className="number mt-2 text-base text-on-brand/85">{formatDate(next.start_at)}</p>
                    <p className="number text-base text-on-brand/85">
                      {formatTime(next.start_at)} to {formatTime(next.end_at)}
                    </p>
                  </div>
                  <StatusBadge status={next.status} />
                </div>
                <div className="flex items-end justify-between gap-4 border-t border-on-brand/15 px-5 py-4 sm:px-7">
                  <div>
                    <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-brass-soft uppercase">
                      {next.reference_no ? "Reference number" : "Request number"}
                    </p>
                    <p className="mt-0.5 font-mono text-xl font-semibold tracking-wide">
                      {next.reference_no ?? `#${next.reservation_id}`}
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    {next.status === "approved" ? "Open it" : "See the status"}
                    <Icon
                      name="arrow"
                      className="size-4 transition-transform duration-200 ease-settle group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            ) : (
              <div className="rounded-2xl border border-dashed border-line-strong bg-surface p-6 sm:p-8">
                <p className="display text-2xl">Nothing booked yet.</p>
                <p className="mt-2 max-w-md text-[0.9375rem] text-ink-soft">
                  {canBook
                    ? "Pick an amenity and a free time. Your request shows up here with its status."
                    : "You can look at the calendar now. Booking opens once the HOA verifies your residency."}
                </p>
                <Link href={canBook ? "/book" : "/calendar"} className="btn btn-primary mt-5">
                  {canBook ? "Book an amenity" : "Open the calendar"}
                </Link>
              </div>
            )}
          </section>

          {later.length > 0 && (
            <section aria-labelledby="later-title">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2 id="later-title" className="eyebrow">
                  Also coming up
                </h2>
                <Link href="/reservations" className="text-sm font-medium text-brand hover:underline">
                  All reservations
                </Link>
              </div>
              <ul className="list-card">
                {later.map((row) => (
                  <li key={row.reservation_id}>
                    <ReservationRow
                      href={`/reservations/${row.reservation_id}`}
                      amenity={row.amenities?.name ?? ""}
                      startAt={row.start_at}
                      endAt={row.end_at}
                      referenceNo={row.reference_no}
                      reservationId={row.reservation_id}
                      totalFee={row.total_fee}
                      status={row.status}
                      note={
                        row.status === "pending" && row.payments.length === 0 ? "no proof of payment yet" : undefined
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <section aria-labelledby="amenities-title">
          <h2 id="amenities-title" className="eyebrow mb-3">
            Amenities
          </h2>
          {amenities.length === 0 ? (
            <p className="text-[0.9375rem] text-ink-soft">No amenity is open for booking yet.</p>
          ) : (
            <ul className="list-card">
              {amenities.map((amenity) => (
                <li key={amenity.amenity_id}>
                  <Link
                    href={canBook ? `/book?amenity=${amenity.amenity_id}` : "/calendar"}
                    className="row-link group justify-between"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-base font-semibold">{amenity.name}</span>
                      <span className="number block text-[0.8125rem] text-ink-soft">
                        {formatClock(amenity.open_time)} to {formatClock(amenity.close_time)} ·{" "}
                        {formatMoney(amenity.rate_resident)} an hour
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand">
                      {canBook ? "Book" : "See"}
                      <Icon
                        name="chevron-right"
                        className="size-4 transition-transform duration-200 ease-settle group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/calendar"
            className="mt-3 flex items-center gap-2 px-1 text-sm font-medium text-ink-soft transition-colors duration-150 hover:text-ink"
          >
            <Icon name="calendar" className="size-4" />
            See the free hours on the calendar
          </Link>
        </section>
      </div>
    </>
  );
}
