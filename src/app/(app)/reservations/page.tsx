import type { Metadata } from "next";
import Link from "next/link";
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
        <div className="panel text-base">
          <p className="font-semibold">You have no reservations yet.</p>
          <p className="mt-1 text-ink-soft">
            Check the calendar for a free time, then send a request. It shows up here with its status.
          </p>
          <Link href="/calendar" className="btn btn-quiet mt-4">
            Open the calendar
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <li key={row.reservation_id}>
              <Link href={`/reservations/${row.reservation_id}`} className="tile flex h-full flex-col gap-3">
                <span className="flex items-start justify-between gap-3">
                  <span className="text-lg font-bold">{row.amenities?.name}</span>
                  <StatusBadge status={row.status} />
                </span>
                <span className="number text-base text-ink-soft">
                  {formatDate(row.start_at)}
                  <br />
                  {formatTime(row.start_at)} to {formatTime(row.end_at)}
                </span>
                <span className="number mt-auto flex items-center justify-between gap-3 border-t border-line pt-3 text-sm text-ink-soft">
                  <span className={row.reference_no ? "font-mono font-semibold text-ink" : ""}>
                    {displayNumber(row)}
                  </span>
                  <span className="text-base font-semibold text-ink">{formatMoney(row.total_fee)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
