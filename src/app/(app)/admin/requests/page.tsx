import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";
import FilterTabs from "@/components/filter-tabs";
import ReservationRow from "@/components/reservation-row";
import { requireRole } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase-server";
import type { Reservation } from "@/lib/types";

export const metadata: Metadata = {
  title: "Requests | ReserBa",
};

type Row = Reservation & {
  amenities: { name: string } | null;
  booker: { full_name: string } | null;
  payments: Array<{ status: string }>;
};

const tabs = [
  { key: "pending", label: "Waiting" },
  { key: "payments", label: "Proofs to check" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
];

// The requests queue (FR-16). Requests that are waiting come first, oldest at
// the top, so they are decided in the order they arrived.
export default async function RequestsPage({ searchParams }: PageProps<"/admin/requests">) {
  await requireRole("admin");
  const params = await searchParams;
  const show = tabs.some((tab) => tab.key === params.show) ? String(params.show) : "pending";

  const supabase = await getServerSupabase();
  const columns =
    "*, amenities(name), booker:users!reservations_user_id_fkey(full_name), payments(status)";
  let rows: Row[] = [];
  if (show === "payments") {
    // Reservations that have at least one proof the administrator has not checked.
    const { data } = await supabase
      .from("reservations")
      .select(columns.replace("payments(status)", "payments!inner(status)"))
      .eq("payments.status", "submitted")
      .order("start_at");
    rows = (data ?? []) as unknown as Row[];
  } else {
    const { data } = await supabase
      .from("reservations")
      .select(columns)
      .eq("status", show)
      .order(show === "pending" ? "created_at" : "start_at", { ascending: show === "pending" })
      .limit(200);
    rows = (data ?? []) as unknown as Row[];
  }

  return (
    <>
      <PageHeader title="Reservation requests">
        <Link href="/admin/walk-in" className="btn btn-primary">
          Encode a walk-in
        </Link>
      </PageHeader>

      <FilterTabs label="Filter requests" basePath="/admin/requests" tabs={tabs} current={show} />

      {rows.length === 0 ? (
        <EmptyState icon="inbox" title="Nothing here">
          {show === "pending"
            ? "No request is waiting for a decision. New ones appear here, oldest first."
            : "No reservation matches this filter."}
        </EmptyState>
      ) : (
        <ul className="list-card">
          {rows.map((row) => (
            <li key={row.reservation_id}>
              <ReservationRow
                href={`/admin/requests/${row.reservation_id}`}
                amenity={row.amenities?.name ?? ""}
                forWhom={`${row.guest_name ?? row.booker?.full_name ?? ""}${row.guest_name ? " (guest)" : ""}`}
                startAt={row.start_at}
                endAt={row.end_at}
                referenceNo={row.reference_no}
                reservationId={row.reservation_id}
                totalFee={row.total_fee}
                status={row.status}
                note={row.payments.some((payment) => payment.status === "submitted") ? "proof to check" : undefined}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
