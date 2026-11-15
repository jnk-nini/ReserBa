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
        <ul className="flex flex-col divide-y divide-line rounded-xl border border-line bg-surface">
          {rows.map((row) => (
            <li key={row.reservation_id}>
              <Link
                href={`/reservations/${row.reservation_id}`}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 transition-colors duration-150 hover:bg-brand-tint"
              >
                <div>
                  <p className="text-base font-semibold">{row.amenities?.name}</p>
                  <p className="number text-sm text-ink-soft">
                    {formatDate(row.start_at)}, {formatTime(row.start_at)} to {formatTime(row.end_at)}
                  </p>
                  <p className="number text-sm text-ink-soft">
                    <span className={row.reference_no ? "font-mono font-semibold text-ink" : ""}>
                      {displayNumber(row)}
                    </span>
                    {" · "}
                    {formatMoney(row.total_fee)}
                  </p>
                </div>
                <StatusBadge status={row.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
