"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { friendlyError } from "@/lib/errors";
import { getServerSupabase } from "@/lib/supabase-server";
import type { FormState } from "@/lib/types";

// A resident cancels their own request while it is still waiting. The database
// allows nothing else from a resident.
export async function cancelReservation(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole("resident");
  const reservationId = Number(formData.get("reservation_id"));
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("reservation_id", reservationId)
    .eq("status", "pending")
    .select("reservation_id");
  if (error) {
    return { error: friendlyError(error) };
  }
  if (!data || data.length === 0) {
    return { error: "Only a request that is still waiting can be cancelled. Ask the HOA administrator." };
  }
  revalidatePath("/reservations");
  return { ok: "The request was cancelled." };
}

// A resident tells the HOA they paid, with the proof file already uploaded by
// the browser. It is saved as "submitted"; only an administrator can confirm it.
export async function submitPaymentProof(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole("resident");
  const reservationId = Number(formData.get("reservation_id"));
  const kind = String(formData.get("kind"));
  const method = String(formData.get("method"));
  const amount = Number(formData.get("amount"));
  const proofPath = String(formData.get("proof_path") ?? "");
  if (!["fee", "deposit"].includes(kind) || !["cash", "e-wallet"].includes(method)) {
    return { error: "Choose what the payment is for and how it was paid." };
  }
  if (!(amount > 0)) {
    return { error: "Type the amount you paid." };
  }
  if (!proofPath) {
    return { error: "Attach the proof of payment." };
  }

  const supabase = await getServerSupabase();
  const { error } = await supabase.from("payments").insert({
    reservation_id: reservationId,
    kind,
    method,
    amount,
    proof_url: proofPath,
  });
  if (error) {
    return { error: friendlyError(error) };
  }
  revalidatePath(`/reservations/${reservationId}`);
  return { ok: "Proof received. The HOA administrator will check it." };
}
