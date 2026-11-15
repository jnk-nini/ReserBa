import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ActionForm from "@/components/action-form";
import PageHeader from "@/components/page-header";
import PaymentList from "@/components/payment-list";
import PaymentProofForm from "@/components/payment-proof-form";
import ReservationSummary from "@/components/reservation-summary";
import { requireRole } from "@/lib/auth";
import { displayNumber, paidSoFar, reservationDetailColumns, type ReservationDetail } from "@/lib/reservations";
import { getServerSupabase } from "@/lib/supabase-server";
import { cancelReservation } from "../actions";

export const metadata: Metadata = {
  title: "Reservation | ReserBa",
};

export default async function ReservationPage({ params }: PageProps<"/reservations/[id]">) {
  const user = await requireRole("resident", "admin");
  const { id } = await params;
  if (user.role === "admin") {
    redirect(`/admin/requests/${id}`);
  }

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
  const paid = paidSoFar(reservation.payments);
  const open = reservation.status === "pending" || reservation.status === "approved";

  return (
    <>
      <PageHeader title={displayNumber(reservation)}>
        {reservation.status === "approved" && (
          <Link href={`/reservations/${reservation.reservation_id}/slip`} className="btn btn-primary">
            Open the slip
          </Link>
        )}
        <Link href="/reservations" className="btn btn-quiet">
          All my reservations
        </Link>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-6">
          <ReservationSummary reservation={reservation} />

          {reservation.status === "pending" && (
            <section className="panel">
              <h2 className="text-base font-semibold">Waiting for approval</h2>
              <p className="mt-1 mb-4 text-base text-ink-soft">
                The HOA administrator will approve or reject this request. The time is held for you
                until then. You can cancel it while it is waiting.
              </p>
              <ActionForm
                action={cancelReservation}
                submitLabel="Cancel this request"
                pendingLabel="Cancelling..."
                buttonClass="btn btn-danger self-start"
                confirmMessage="Cancel this request? The time becomes free for others."
              >
                <input type="hidden" name="reservation_id" value={reservation.reservation_id} />
              </ActionForm>
            </section>
          )}
        </div>

        <section className="panel flex flex-col gap-4">
          <h2 className="text-base font-semibold">Payments</h2>
          <PaymentList payments={reservation.payments} />
          {open && (
            <>
              <h3 className="border-t border-line pt-4 text-base font-semibold">Send a proof of payment</h3>
              <p className="-mt-2 text-sm text-ink-soft">
                Pay the HOA in cash or by e-wallet, then send the proof here. The administrator
                confirms it.
              </p>
              <PaymentProofForm
                reservationId={reservation.reservation_id}
                userId={user.user_id}
                feeLeft={Math.max(0, Number(reservation.total_fee) - paid.fee)}
                depositLeft={Math.max(0, Number(reservation.deposit) - paid.deposit)}
              />
            </>
          )}
        </section>
      </div>
    </>
  );
}
