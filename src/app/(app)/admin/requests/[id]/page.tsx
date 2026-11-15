import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm from "@/components/action-form";
import DayStrip, { StripLegend, type StripSegment } from "@/components/day-strip";
import PageHeader from "@/components/page-header";
import ReservationSummary from "@/components/reservation-summary";
import StatusBadge from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { proofLink } from "@/lib/links";
import { formatMoney } from "@/lib/money";
import { displayNumber, paidSoFar, reservationDetailColumns, type ReservationDetail } from "@/lib/reservations";
import { getServerSupabase } from "@/lib/supabase-server";
import {
  addDays,
  formatDate,
  formatDateTime,
  isPast,
  manilaDate,
  manilaMinutes,
  manilaToIso,
  timeToMinutes,
  todayInManila,
} from "@/lib/time";
import type { Amenity, TakenRange } from "@/lib/types";
import {
  decideReservation,
  markEquipment,
  recordNewPayment,
  recordSubmittedPayment,
  voidPayment,
} from "../actions";

export const metadata: Metadata = {
  title: "Request | ReserBa",
};

// One reservation, for the administrator: the facts, the decision, the
// payments, and the equipment.
export default async function RequestPage({ params }: PageProps<"/admin/requests/[id]">) {
  await requireRole("admin");
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
  const reservationId = reservation.reservation_id;
  const paid = paidSoFar(reservation.payments);
  const open = reservation.status === "pending" || reservation.status === "approved";

  // The day of this request on a strip, so the administrator sees what else is
  // on the amenity that day and whether a block was added over the request.
  const day = manilaDate(reservation.start_at);
  const [amenityResult, takenResult, blockResult] = await Promise.all([
    supabase.from("amenities").select("*").eq("amenity_id", reservation.amenity_id).single(),
    supabase
      .from("availability")
      .select("amenity_id, start_at, end_at, kind")
      .eq("amenity_id", reservation.amenity_id)
      .lt("start_at", manilaToIso(addDays(day, 1), "00:00"))
      .gt("end_at", manilaToIso(day, "00:00")),
    supabase
      .from("blocked_dates")
      .select("reason")
      .eq("amenity_id", reservation.amenity_id)
      .lt("start_at", reservation.occupied_until)
      .gt("end_at", reservation.start_at),
  ]);
  const amenity = amenityResult.data as Amenity;
  const blockedBy = (blockResult.data ?? []) as Array<{ reason: string }>;
  const segments: StripSegment[] = ((takenResult.data ?? []) as TakenRange[])
    // This request is drawn separately as "choice", so leave it out here.
    .filter((range) => !(range.start_at === reservation.start_at && range.kind !== "blocked"))
    .map((range) => ({
      kind: range.kind,
      from: manilaDate(range.start_at) < day ? 0 : manilaMinutes(range.start_at),
      to: manilaDate(range.end_at) > day ? 24 * 60 : manilaMinutes(range.end_at),
    }));
  segments.push({
    kind: "buffer",
    from: manilaMinutes(reservation.end_at),
    to: manilaMinutes(reservation.end_at) + amenity.buffer_minutes,
  });
  segments.push({ kind: "choice", from: manilaMinutes(reservation.start_at), to: manilaMinutes(reservation.end_at) });

  const payments = [...reservation.payments].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <>
      <PageHeader title={displayNumber(reservation)} description={`Requested ${formatDateTime(reservation.created_at)}`}>
        {reservation.status === "approved" && (
          <Link href={`/reservations/${reservationId}/slip`} className="btn btn-primary">
            Open the slip
          </Link>
        )}
        <Link href="/admin/requests" className="btn btn-quiet">
          All requests
        </Link>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-6">
          <ReservationSummary reservation={reservation} />

          <section className="panel flex flex-col gap-3">
            <h2 className="text-lg font-bold">
              {amenity.name} on {formatDate(reservation.start_at)}
            </h2>
            <DayStrip
              openMinutes={timeToMinutes(amenity.open_time)}
              closeMinutes={timeToMinutes(amenity.close_time)}
              segments={segments}
            />
            <StripLegend showChoice choiceLabel="This request" />
          </section>

          {reservation.reservation_equipment.length > 0 && (
            <section className="panel flex flex-col gap-4">
              <h2 className="text-lg font-bold">Equipment</h2>
              {reservation.reservation_equipment.map((line) => (
                <div key={line.id} className="flex flex-col gap-2 border-t border-line pt-3 first:border-t-0 first:pt-0">
                  <p className="text-base font-semibold">
                    {line.equipment?.name} x {line.quantity}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {line.lent_at ? `Lent ${formatDateTime(line.lent_at)}.` : "Not yet handed out."}{" "}
                    {line.returned_at && `Returned ${formatDateTime(line.returned_at)}: ${line.return_condition}.`}
                  </p>
                  {reservation.status === "approved" && !line.lent_at && (
                    <ActionForm action={markEquipment} submitLabel="Mark as lent" buttonClass="btn btn-quiet btn-small self-start">
                      <input type="hidden" name="reservation_id" value={reservationId} />
                      <input type="hidden" name="line_id" value={line.id} />
                      <input type="hidden" name="step" value="lent" />
                    </ActionForm>
                  )}
                  {line.lent_at && !line.returned_at && (
                    <ActionForm action={markEquipment} submitLabel="Mark as returned" buttonClass="btn btn-quiet btn-small self-start">
                      <input type="hidden" name="reservation_id" value={reservationId} />
                      <input type="hidden" name="line_id" value={line.id} />
                      <input type="hidden" name="step" value="returned" />
                      <label className="label">
                        Condition on return
                        <input name="return_condition" required className="input" placeholder="Good, or what is damaged or missing" />
                      </label>
                    </ActionForm>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {reservation.status === "pending" && (
            <section className="panel flex flex-col gap-4">
              <h2 className="text-lg font-bold">Decide this request</h2>
              {blockedBy.length > 0 && (
                <p className="notice notice-error">
                  A blocked date now covers this time ({blockedBy.map((block) => block.reason).join(", ")}).
                  It cannot be approved; reject it with that reason.
                </p>
              )}
              {isPast(reservation.start_at) && (
                <p className="notice notice-info">The start time of this request has already passed.</p>
              )}
              <ActionForm
                action={decideReservation}
                submitLabel="Approve"
                pendingLabel="Checking and approving..."
              >
                <input type="hidden" name="reservation_id" value={reservationId} />
                <input type="hidden" name="decision" value="approved" />
              </ActionForm>
              <ActionForm
                action={decideReservation}
                submitLabel="Reject"
                pendingLabel="Rejecting..."
                buttonClass="btn btn-danger self-start"
                className="flex flex-col gap-3 border-t border-line pt-4"
              >
                <input type="hidden" name="reservation_id" value={reservationId} />
                <input type="hidden" name="decision" value="rejected" />
                <label className="label">
                  Reason for rejecting
                  <textarea name="reason" required rows={2} className="input" />
                  <span className="hint">The resident sees this reason.</span>
                </label>
              </ActionForm>
            </section>
          )}

          {reservation.status === "approved" && (
            <section className="panel flex flex-col gap-3">
              <h2 className="text-lg font-bold">Cancel this reservation</h2>
              <p className="text-base text-ink-soft">
                Cancelling frees the time. Payments already recorded stay; void them below if the money is
                returned.
              </p>
              <ActionForm
                action={decideReservation}
                submitLabel="Cancel the reservation"
                pendingLabel="Cancelling..."
                buttonClass="btn btn-danger self-start"
                confirmMessage="Cancel this approved reservation? This cannot be undone."
              >
                <input type="hidden" name="reservation_id" value={reservationId} />
                <input type="hidden" name="decision" value="cancelled" />
              </ActionForm>
            </section>
          )}

          <section className="panel flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">Payments</h2>
              <p className="number text-sm text-ink-soft">
                Fee {formatMoney(paid.fee)} of {formatMoney(reservation.total_fee)} · Deposit{" "}
                {formatMoney(paid.deposit)} of {formatMoney(reservation.deposit)}
              </p>
            </div>

            {payments.length === 0 && <p className="text-base text-ink-soft">No payment yet.</p>}
            {payments.map((payment) => (
              <div key={payment.payment_id} className="flex flex-col gap-2 border-t border-line pt-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="number text-base font-semibold">
                    {formatMoney(payment.amount)}{" "}
                    <span className="font-normal text-ink-soft">
                      {payment.kind}, {payment.method}, {formatDate(payment.paid_at ?? payment.created_at)}
                    </span>
                  </p>
                  <StatusBadge status={payment.status} />
                </div>
                {payment.status === "void" && <p className="text-sm text-ink-soft">Void: {payment.void_reason}</p>}
                {payment.proof_url && (
                  <a
                    href={proofLink("payment-proofs", payment.proof_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="self-start text-sm font-semibold text-brand underline underline-offset-4"
                  >
                    Open the proof
                  </a>
                )}
                {payment.status === "submitted" && (
                  <ActionForm
                    action={recordSubmittedPayment}
                    submitLabel="Record this payment"
                    buttonClass="btn btn-primary btn-small self-start"
                    className="flex flex-col gap-2"
                  >
                    <input type="hidden" name="reservation_id" value={reservationId} />
                    <input type="hidden" name="payment_id" value={payment.payment_id} />
                    <label className="label">
                      Amount received (pesos)
                      <input
                        name="amount"
                        type="number"
                        inputMode="decimal"
                        min="0.01"
                        step="0.01"
                        required
                        defaultValue={Number(payment.amount).toFixed(2)}
                        className="input number"
                      />
                    </label>
                  </ActionForm>
                )}
                {payment.status !== "void" && (
                  <details className="text-sm">
                    <summary className="cursor-pointer font-semibold text-refused">Mark as void</summary>
                    <ActionForm
                      action={voidPayment}
                      submitLabel="Void this payment"
                      buttonClass="btn btn-danger btn-small self-start"
                      className="mt-2 flex flex-col gap-2"
                      confirmMessage="Void this payment? It stays in the records but is no longer counted."
                    >
                      <input type="hidden" name="reservation_id" value={reservationId} />
                      <input type="hidden" name="payment_id" value={payment.payment_id} />
                      <label className="label">
                        Reason
                        <input name="reason" required className="input" />
                      </label>
                    </ActionForm>
                  </details>
                )}
              </div>
            ))}

            {open && (
              <div className="border-t border-line pt-4">
                <h3 className="mb-3 text-base font-bold">Record a payment received</h3>
                <ActionForm action={recordNewPayment} submitLabel="Record payment">
                  <input type="hidden" name="reservation_id" value={reservationId} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="label">
                      Payment for
                      <select name="kind" className="input" defaultValue="fee">
                        <option value="fee">Reservation fee</option>
                        <option value="deposit">Security deposit</option>
                      </select>
                    </label>
                    <label className="label">
                      Paid by
                      <select name="method" className="input" defaultValue="cash">
                        <option value="cash">Cash</option>
                        <option value="e-wallet">E-wallet transfer</option>
                      </select>
                    </label>
                    <label className="label">
                      Amount (pesos)
                      <input
                        name="amount"
                        type="number"
                        inputMode="decimal"
                        min="0.01"
                        step="0.01"
                        required
                        className="input number"
                      />
                    </label>
                    <label className="label">
                      Date received
                      <input
                        name="paid_on"
                        type="date"
                        required
                        defaultValue={todayInManila()}
                        max={todayInManila()}
                        className="input"
                      />
                    </label>
                  </div>
                </ActionForm>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
