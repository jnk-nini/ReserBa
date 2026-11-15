"use client";

import { useActionState, useState } from "react";
import { submitPaymentProof } from "@/app/(app)/reservations/actions";
import { checkProofFile, uploadProof } from "@/lib/upload";

// The resident's "I have paid" form (FR-19). The proof file is uploaded from
// the browser to the private bucket first; then the form is sent with the
// file's path in a hidden field.
export default function PaymentProofForm({
  reservationId,
  userId,
  feeLeft,
  depositLeft,
}: {
  reservationId: number;
  userId: string;
  feeLeft: number;
  depositLeft: number;
}) {
  const [state, formAction, pending] = useActionState(submitPaymentProof, {});
  const [kind, setKind] = useState(feeLeft > 0 || depositLeft <= 0 ? "fee" : "deposit");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const suggested = kind === "fee" ? feeLeft : depositLeft;

  async function handleSubmit(formData: FormData) {
    setUploadError(null);
    const file = formData.get("proof");
    if (!(file instanceof File) || file.size === 0) {
      setUploadError("Attach a photo or PDF of your receipt or transfer.");
      return;
    }
    const problem = checkProofFile(file);
    if (problem) {
      setUploadError(problem);
      return;
    }
    setUploading(true);
    try {
      const path = await uploadProof("payment-proofs", userId, file);
      formData.delete("proof");
      formData.set("proof_path", path);
      formAction(formData);
    } catch (caught) {
      setUploadError(caught instanceof Error ? caught.message : "Upload failed.");
    }
    setUploading(false);
  }

  const busy = uploading || pending;

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="reservation_id" value={reservationId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="label">
          Payment for
          <select name="kind" className="input" value={kind} onChange={(event) => setKind(event.target.value)}>
            <option value="fee">Reservation fee</option>
            <option value="deposit">Security deposit</option>
          </select>
        </label>
        <label className="label">
          Paid by
          <select name="method" className="input" defaultValue="e-wallet">
            <option value="e-wallet">E-wallet transfer</option>
            <option value="cash">Cash</option>
          </select>
        </label>
      </div>
      <label className="label">
        Amount paid (pesos)
        <input
          // A new key refills the amount when the kind of payment changes.
          key={kind}
          name="amount"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          required
          defaultValue={suggested > 0 ? suggested.toFixed(2) : ""}
          className="input number"
        />
      </label>
      <label className="label">
        Proof of payment
        <input
          name="proof"
          type="file"
          required
          accept="image/jpeg,image/png,application/pdf"
          className="input file:mr-3 file:rounded-md file:border-0 file:bg-brand-tint file:px-3 file:py-1 file:font-semibold file:text-brand"
        />
        <span className="hint">A screenshot of the transfer or a photo of the receipt. JPG, PNG, or PDF, up to 5 MB.</span>
      </label>
      {(uploadError || state.error) && (
        <p role="alert" className="notice notice-error">
          {uploadError ?? state.error}
        </p>
      )}
      {state.ok && !uploadError && (
        <p role="status" className="notice notice-ok">
          {state.ok}
        </p>
      )}
      <button type="submit" disabled={busy} className="btn btn-primary self-start">
        {busy ? "Sending..." : "Send the proof"}
      </button>
    </form>
  );
}
