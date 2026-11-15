import type { Metadata } from "next";
import Link from "next/link";
import AmenityArt from "@/components/amenity-art";
import EmptyState from "@/components/empty-state";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { displayNumber } from "@/lib/reservations";
import { getServerSupabase } from "@/lib/supabase-server";
import { formatDate, formatTime } from "@/lib/time";
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
          icon="calendar"
          title="You have no reservations yet"
          action={
            <Link href="/calendar" className="btn btn-quiet">
              Open the calendar
            </Link>
          }
        >
          Check the calendar for a free time, then send a request. It shows up here with its status.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <li key={row.reservation_id}>
              <Link href={`/reservations/${row.reservation_id}`} className="tile group flex h-full flex-col overflow-hidden p-0">
                <AmenityArt name={row.amenities?.name ?? ""} className="h-24 object-cover" />
                <span className="flex flex-1 flex-col gap-3 p-5">
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-base font-semibold">{row.amenities?.name}</span>
                    <StatusBadge status={row.status} />
                  </span>
                  <span className="number text-[0.9375rem] text-ink-soft">
                    {formatDate(row.start_at)}
                    <br />
                    {formatTime(row.start_at)} to {formatTime(row.end_at)}
                  </span>
                  <span className="number mt-auto flex items-center justify-between gap-3 border-t border-line pt-3 text-sm text-ink-soft">
                    <span className={row.reference_no ? "font-mono font-medium text-ink" : ""}>
                      {displayNumber(row)}
                    </span>
                    <span className="text-[0.9375rem] font-semibold text-ink">{formatMoney(row.total_fee)}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
