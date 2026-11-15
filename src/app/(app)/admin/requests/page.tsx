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

      <nav aria-label="Filter requests" className="mb-4 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/requests?show=${tab.key}`}
            aria-current={show === tab.key ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-base font-semibold whitespace-nowrap transition-colors duration-150 ${
              show === tab.key ? "bg-brand text-on-brand" : "text-ink hover:bg-brand-tint/70"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="panel text-base text-ink-soft">Nothing here.</p>
      ) : (
        <ul className="panel-flush flex flex-col divide-y divide-line">
          {rows.map((row) => (
            <li key={row.reservation_id}>
              <Link
                href={`/admin/requests/${row.reservation_id}`}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 transition-colors duration-150 hover:bg-brand-tint/70"
              >
                <div>
                  <p className="text-base font-semibold">
                    {row.amenities?.name}
                    <span className="font-normal text-ink-soft">
                      {" "}
                      for {row.guest_name ?? row.booker?.full_name}
                      {row.guest_name && " (guest)"}
                    </span>
                  </p>
                  <p className="number text-sm text-ink-soft">
                    {formatDate(row.start_at)}, {formatTime(row.start_at)} to {formatTime(row.end_at)}
                  </p>
                  <p className="number text-sm text-ink-soft">
                    <span className={row.reference_no ? "font-mono font-semibold text-ink" : ""}>
                      {displayNumber(row)}
                    </span>
                    {" · "}
                    {formatMoney(row.total_fee)}
                    {row.payments.some((payment) => payment.status === "submitted") && " · proof to check"}
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
