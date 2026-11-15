import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";
import ReservationRow from "@/components/reservation-row";
import { requireRole } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase-server";
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

  return (
    <>
      <PageHeader title="My reservations" description="Your requests and their status, newest date first.">
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
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-low">
          {rows.map((row) => (
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
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
