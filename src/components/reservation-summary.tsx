import StatusBadge from "@/components/status-badge";
import { formatMoney } from "@/lib/money";
import { bookedBy, paidSoFar, type ReservationDetail } from "@/lib/reservations";
import { formatDate, formatTime } from "@/lib/time";

// The facts of one reservation: what, when, who, and the money. Shown on the
// resident's detail screen and on the administrator's request screen. The
// order follows what people look for: the amenity and the time first, the
// reference number next, and the money last with the balance in bold.
export default function ReservationSummary({ reservation }: { reservation: ReservationDetail }) {
  const paid = paidSoFar(reservation.payments);
  const rental =
    Number(reservation.total_fee) -
    reservation.reservation_equipment.reduce(
      (sum, line) => sum + line.quantity * Number(line.equipment?.rate ?? 0),
      0,
    );
  const feeLeft = Math.max(0, Number(reservation.total_fee) - paid.fee);
  const depositLeft = Math.max(0, Number(reservation.deposit) - paid.deposit);
  const open = reservation.status === "pending" || reservation.status === "approved";

  return (
    <section className="panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="display text-[1.75rem] sm:text-[2rem]">{reservation.amenities?.name}</h2>
          <p className="number mt-2 text-base">
            {formatDate(reservation.start_at)}
            <br />
            {formatTime(reservation.start_at)} to {formatTime(reservation.end_at)}
          </p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      {reservation.reference_no && (
        <div className="mt-5 rounded-xl bg-brand-tint px-4 py-3">
          <p className="eyebrow text-brand/80">Reference number</p>
          <p className="mt-0.5 font-mono text-2xl font-semibold tracking-wider text-brand">{reservation.reference_no}</p>
        </div>
      )}
      {reservation.status === "rejected" && (
        <p className="notice notice-error mt-4">
          <span className="font-semibold">Reason from the HOA:</span> {reservation.reject_reason}
        </p>
      )}

      <dl className="number mt-5 flex flex-col gap-2.5 border-t border-line pt-5 text-[0.9375rem]">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Booked by</dt>
          <dd className="text-right font-medium">{bookedBy(reservation)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Use of the amenity{reservation.guest_name && " (non-resident rate)"}</dt>
          <dd>{formatMoney(rental)}</dd>
        </div>
        {reservation.reservation_equipment.map((line) => (
          <div key={line.id} className="flex justify-between gap-3">
            <dt className="text-ink-soft">
              {line.equipment?.name} &times; {line.quantity}
            </dt>
            <dd>{formatMoney(line.quantity * Number(line.equipment?.rate ?? 0))}</dd>
          </div>
        ))}
        <div className="mt-1 flex justify-between gap-3 border-t border-line pt-3 text-base font-semibold">
          <dt>Total fee</dt>
          <dd>{formatMoney(reservation.total_fee)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Fee paid, confirmed by the HOA</dt>
          <dd>{formatMoney(paid.fee)}</dd>
        </div>
        {open && (
          <div className="flex justify-between gap-3 font-semibold">
            <dt>Fee still to pay</dt>
            <dd className={feeLeft > 0 ? "text-pending" : "text-approved"}>
              {feeLeft > 0 ? formatMoney(feeLeft) : "Paid in full"}
            </dd>
          </div>
        )}
        {Number(reservation.deposit) > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-ink-soft">Security deposit</dt>
            <dd className="text-right">
              {formatMoney(reservation.deposit)}{" "}
              <span className="text-ink-soft">
                ({depositLeft === 0 ? "paid" : `${formatMoney(paid.deposit)} paid`})
              </span>
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
