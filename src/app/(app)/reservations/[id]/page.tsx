import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ActionForm from "@/components/action-form";
import Icon from "@/components/icon";
import PageHeader from "@/components/page-header";
import PaymentList from "@/components/payment-list";
import PaymentProofForm from "@/components/payment-proof-form";
import ReservationSummary from "@/components/reservation-summary";
import { requireRole } from "@/lib/auth";
import { displayNumber, paidSoFar, reservationDetailColumns, type ReservationDetail } from "@/lib/reservations";
import { getServerSupabase } from "@/lib/supabase-server";
import { formatDate } from "@/lib/time";
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

  // The three things that happen to a request, so the resident can see at a
  // glance which ones are done and what is still expected of them.
  const proofSent = reservation.payments.some((payment) => payment.status !== "void");
  const feePaid = paid.fee >= Number(reservation.total_fee);
  const steps = [
    { title: "Request sent", note: `On ${formatDate(reservation.created_at)}`, done: true },
    {
      title: "Payment",
      note: feePaid
        ? "The HOA confirmed your payment"
        : proofSent
          ? "Proof sent. The HOA will check it"
          : "Pay the HOA, then send the proof below",
      done: feePaid,
    },
    {
      title: "HOA decision",
      note: reservation.status === "approved" ? "Approved. Your slip is ready" : "Waiting for the administrator",
      done: reservation.status === "approved",
    },
  ];

  return (
    <>
      <PageHeader title={displayNumber(reservation)} back={{ href: "/reservations", label: "My reservations" }}>
        {reservation.status === "approved" && (
          <Link href={`/reservations/${reservation.reservation_id}/slip`} className="btn btn-primary">
            <Icon name="receipt" className="size-[1.125rem]" />
            Open the slip
          </Link>
        )}
      </PageHeader>

      {open && (
        <ol className="panel mb-6 grid gap-4 sm:grid-cols-3 sm:gap-6" aria-label="Where this request is">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span
                className={`number mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  step.done ? "bg-approved text-on-brand" : "border border-line-strong text-ink-soft"
                }`}
              >
                {step.done ? <Icon name="check" className="size-3.5" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[0.9375rem] font-semibold">{step.title}</span>
                <span className="block text-[0.8125rem] text-ink-soft">{step.note}</span>
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-6">
          <ReservationSummary reservation={reservation} />

          {reservation.status === "pending" && (
            <section className="panel">
              <h2 className="text-base font-semibold">Changed your mind?</h2>
              <p className="mt-1 mb-4 text-[0.9375rem] text-ink-soft">
                The time is held for you until the administrator decides. You can cancel the request while it
                is waiting.
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
