import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/icon";
import Logo from "@/components/logo";
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
      (line): [string, string] => ["Equipment", `${line.equipment?.name} \u00d7 ${line.quantity}`],
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
      <div className="no-print mx-auto mb-6 flex max-w-md flex-wrap items-center justify-between gap-3">
        <Link
          href={backLink}
          className="group inline-flex min-h-8 items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors duration-150 hover:text-ink"
        >
          <Icon name="arrow-left" className="size-4 transition-transform duration-200 ease-settle group-hover:-translate-x-0.5" />
          Back to the reservation
        </Link>
        <PrintButton label="Print or save as PDF" />
      </div>

      {/* Drawn like a ticket: the reference number on top, a torn edge, the details below. */}
      <article className="mx-auto max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-high print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <header className="bg-brand px-6 pt-5 pb-6 text-on-brand print:bg-transparent print:px-0 print:text-ink">
          <div className="flex items-center justify-between gap-3">
            <span className="print:hidden">
              <Logo onDark />
            </span>
            <span className="hidden print:block">
              <Logo />
            </span>
            <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-brass-soft uppercase print:text-ink-soft">
              Reservation slip
            </p>
          </div>
          <p className="mt-7 text-[0.6875rem] font-semibold tracking-[0.14em] text-on-brand/70 uppercase print:text-ink-soft">
            Reference number
          </p>
          <p className="mt-1 font-mono text-[2.75rem] leading-none font-semibold tracking-wider">
            {reservation.reference_no}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
            <span className="flex size-4 items-center justify-center rounded-full bg-on-brand text-brand print:bg-approved print:text-on-brand">
              <Icon name="check" className="size-2.5" />
            </span>
            Approved by the HOA
          </p>
        </header>

        <div className="relative border-t border-dashed border-line-strong" aria-hidden="true">
          <span className="absolute -top-2.5 -left-2.5 size-5 rounded-full bg-ground print:hidden" />
          <span className="absolute -top-2.5 -right-2.5 size-5 rounded-full bg-ground print:hidden" />
        </div>

        <div className="px-6 pt-3 pb-6 print:px-0">
          <dl className="number flex flex-col text-[0.9375rem]">
            {rows.map(([label, value], index) => (
              <div key={index} className="flex justify-between gap-4 border-b border-line py-2.5">
                <dt className="text-ink-soft">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 text-[0.8125rem] text-ink-soft">
            Show this slip or say the reference number to the guard on the day of use. Printed{" "}
            {formatDateTime(new Date())}.
          </p>
        </div>
      </article>
    </>
  );
}
