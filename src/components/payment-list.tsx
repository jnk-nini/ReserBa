import StatusBadge from "@/components/status-badge";
import { proofLink } from "@/lib/links";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/time";
import type { Payment } from "@/lib/types";

// The payments of one reservation, newest first, for the resident to read.
export default function PaymentList({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return <p className="text-base text-ink-soft">No payment yet.</p>;
  }
  const sorted = [...payments].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return (
    <ul className="flex flex-col divide-y divide-line">
      {sorted.map((payment) => (
        <li key={payment.payment_id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-base">
          <div>
            <p className="number font-semibold">
              {formatMoney(payment.amount)}{" "}
              <span className="font-normal text-ink-soft">
                {payment.kind === "fee" ? "fee" : "deposit"}, {payment.method}
              </span>
            </p>
            <p className="text-sm text-ink-soft">
              {formatDate(payment.paid_at ?? payment.created_at)}
              {payment.status === "void" && `. Void: ${payment.void_reason}`}
            </p>
            {payment.proof_url && (
              <a
                href={proofLink("payment-proofs", payment.proof_url)}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-brand underline underline-offset-4"
              >
                Open the proof
              </a>
            )}
          </div>
          <StatusBadge status={payment.status} />
        </li>
      ))}
    </ul>
  );
}
