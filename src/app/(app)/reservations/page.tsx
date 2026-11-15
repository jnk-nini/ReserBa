import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";
import ReservationRow from "@/components/reservation-row";
import { requireRole } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase-server";
import { isPast } from "@/lib/time";
import type { Reservation } from "@/lib/types";

export const metadata: Metadata = {
  title: "My reservations | ReserBa",
};

type Row = Reservation & { amenities: { name: string } | null };

export default async function ReservationsPage() {
  const user = await requireRole("resident");
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("reservations")
    .select("*, amenities(name)")
    .eq("user_id", user.user_id)
    .order("start_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as Row[];

  // What is still ahead comes first, soonest at the top. Everything that is
  // over, cancelled, or rejected goes below it, newest first.
  const isOpen = (row: Row) => (row.status === "pending" || row.status === "approved") && !isPast(row.end_at);
  const upcoming = rows.filter(isOpen).reverse();
  const closed = rows.filter((row) => !isOpen(row));

  return (
    <>
      <PageHeader title="My reservations" description="Your requests and their status. What is coming up is listed first.">
        <Link href="/book" className="btn btn-primary">
          Book an amenity
        </Link>
      </PageHeader>

      {rows.length === 0 ? (
        <EmptyState
          icon="ticket"
          title="No reservations yet"
          action={
            <Link href="/calendar" className="btn btn-quiet">
              Open the calendar
            </Link>
          }
        >
          Check the calendar for a free time, then send a request. It shows up here with its status.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-8">
          {[
            { title: "Upcoming", rows: upcoming, past: false },
            { title: "Past and closed", rows: closed, past: true },
          ]
            .filter((group) => group.rows.length > 0)
            .map((group) => (
              <section key={group.title}>
                <h2 className="eyebrow mb-3">
                  {group.title} <span className="number text-ink-soft/70">({group.rows.length})</span>
                </h2>
                <ul className="list-card">
                  {group.rows.map((row) => (
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
                        past={group.past}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}
    </>
  );
}
