import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Logo from "@/components/logo";
import StatusBadge from "@/components/status-badge";
import PrintButton from "@/components/print-button";
import { requireRole } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { bookedBy, paidSoFar, reservationDetailColumns, type ReservationDetail } from "@/lib/reservations";
import { getServerSupabase } from "@/lib/supabase-server";
import { formatDate, formatDateTime, formatTime } from "@/lib/time";

export const metadata: Metadata = {
  title: "Reservation slip | ReserBa",
};

// The printable reservation slip (FR-18). Only an approved reservation has
// one. The resident shows it, or just the reference number, to the guard.
export default async function SlipPage({ params }: PageProps<"/reservations/[id]/slip">) {
  const user = await requireRole("resident", "admin");
  const { id } = await params;
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("reservations")
    .select(reservationDetailColumns)
    .eq("reservation_id", Number(id) || 0)
    .maybeSingle();
  if (!data) {
    notFound();
  }
  const reservation = data as unknown as ReservationDetail;
  const backLink = user.role === "admin" ? `/admin/requests/${id}` : `/reservations/${id}`;

  if (reservation.status !== "approved" || !reservation.reference_no) {
    return (
      <p className="notice notice-info">
        A slip is available only for an approved reservation.{" "}
        <Link href={backLink} className="font-semibold underline underline-offset-4">
          Go back
        </Link>
      </p>
    );
  }

  const paid = paidSoFar(reservation.payments);
  const feeBalance = Math.max(0, Number(reservation.total_fee) - paid.fee);
  const rows: Array<[string, string]> = [
    ["Amenity", reservation.amenities?.name ?? ""],
    ["Date", formatDate(reservation.start_at)],
    ["Time", `${formatTime(reservation.start_at)} to ${formatTime(reservation.end_at)}`],
    ["Reserved for", bookedBy(reservation)],
    ...reservation.reservation_equipment.map(
      (line): [string, string] => ["Equipment", `${line.equipment?.name} x ${line.quantity}`],
    ),
    ["Fee", formatMoney(reservation.total_fee)],
    ["Fee paid", feeBalance === 0 ? "Paid in full" : `${formatMoney(paid.fee)} paid, ${formatMoney(feeBalance)} to pay`],
    [
      "Security deposit",
      Number(reservation.deposit) === 0
        ? "None"
        : `${formatMoney(reservation.deposit)} (${paid.deposit >= Number(reservation.deposit) ? "paid" : `${formatMoney(paid.deposit)} paid`})`,
    ],
  ];

  return (
    <>
      <div className="no-print mb-6 flex flex-wrap gap-2">
        <PrintButton label="Print or save as PDF" />
        <Link href={backLink} className="btn btn-quiet">
          Back
        </Link>
      </div>

      <article className="mx-auto max-w-md rounded-2xl border border-line-strong bg-surface p-7 shadow-raised print:max-w-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex items-center justify-between gap-3 border-b border-dashed border-line-strong pb-4">
          <Logo />
          <p className="text-sm font-medium text-ink-soft">Reservation slip</p>
        </header>

        <p className="mt-5 text-sm text-ink-soft">Reference number</p>
        <p className="font-mono text-4xl font-semibold tracking-wider">{reservation.reference_no}</p>
        <p className="mt-2"><StatusBadge status="approved" /></p>

        <dl className="number mt-5 flex flex-col text-base">
          {rows.map(([label, value], index) => (
            <div key={index} className="flex justify-between gap-4 border-t border-line py-2">
              <dt className="text-ink-soft">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 border-t border-line-strong pt-3 text-sm text-ink-soft">
          Show this slip or say the reference number to the guard on the day of use. Printed{" "}
          {formatDateTime(new Date())}.
        </p>
      </article>
    </>
  );
}
