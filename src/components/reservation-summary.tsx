import StatusBadge from "@/components/status-badge";
import { formatMoney } from "@/lib/money";
import { bookedBy, paidSoFar, type ReservationDetail } from "@/lib/reservations";
import { formatDate, formatTime } from "@/lib/time";

// The facts of one reservation: what, when, who, and the money. Shown on the
// resident's detail screen and on the administrator's request screen.
export default function ReservationSummary({ reservation }: { reservation: ReservationDetail }) {
  const paid = paidSoFar(reservation.payments);
  const rental =
    Number(reservation.total_fee) -
    reservation.reservation_equipment.reduce(
      (sum, line) => sum + line.quantity * Number(line.equipment?.rate ?? 0),
      0,
    );

  return (
    <section className="panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{reservation.amenities?.name}</h2>
          <p className="number mt-1 text-base">
            {formatDate(reservation.start_at)}
            <br />
            {formatTime(reservation.start_at)} to {formatTime(reservation.end_at)}
          </p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      {reservation.reference_no && (
        <p className="mt-3 text-base">
          Reference number{" "}
          <span className="font-mono text-lg font-bold tracking-wide">{reservation.reference_no}</span>
        </p>
      )}
      {reservation.status === "rejected" && (
        <p className="notice notice-error mt-3">Reason: {reservation.reject_reason}</p>
      )}

      <dl className="number mt-4 flex flex-col gap-2 border-t border-line pt-4 text-base">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Booked by</dt>
          <dd className="text-right">{bookedBy(reservation)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Use of the amenity{reservation.guest_name && " (non-resident rate)"}</dt>
          <dd>{formatMoney(rental)}</dd>
        </div>
        {reservation.reservation_equipment.map((line) => (
          <div key={line.id} className="flex justify-between gap-3">
            <dt className="text-ink-soft">
              {line.equipment?.name} x {line.quantity}
            </dt>
            <dd>{formatMoney(line.quantity * Number(line.equipment?.rate ?? 0))}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 font-bold">
          <dt>Fee</dt>
          <dd>{formatMoney(reservation.total_fee)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Fee paid (confirmed by the HOA)</dt>
          <dd>{formatMoney(paid.fee)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Security deposit</dt>
          <dd>
            {formatMoney(reservation.deposit)}
            {Number(reservation.deposit) > 0 && ` (${formatMoney(paid.deposit)} paid)`}
          </dd>
        </div>
      </dl>
    </section>
  );
}
