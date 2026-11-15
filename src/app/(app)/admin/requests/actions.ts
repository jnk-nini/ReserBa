"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { friendlyError } from "@/lib/errors";
import { getServerSupabase } from "@/lib/supabase-server";
import { isValidDate, manilaToIso } from "@/lib/time";
import type { FormState } from "@/lib/types";

// What an administrator does to one reservation: decide it, handle its
// payments, and note equipment lent and returned. Each action only changes a
// row; the database checks the rules again and writes the audit log by itself.

function refresh(reservationId: number) {
  revalidatePath(`/admin/requests/${reservationId}`);
}

// Approve, reject (with a reason), or cancel a reservation (FR-16).
// On approval the database checks blocked dates again and gives the reference
// number.
export async function decideReservation(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");
  const reservationId = Number(formData.get("reservation_id"));
  const decision = String(formData.get("decision"));
  const reason = String(formData.get("reason") ?? "").trim();
  if (!["approved", "rejected", "cancelled"].includes(decision)) {
    return { error: "Choose approve, reject, or cancel." };
  }
  if (decision === "rejected" && !reason) {
    return { error: "Write the reason for rejecting. The resident will see it." };
  }

  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("reservations")
    .update(decision === "rejected" ? { status: decision, reject_reason: reason } : { status: decision })
    .eq("reservation_id", reservationId)
    .select("reference_no");
  if (error) {
    return { error: friendlyError(error) };
  }
  if (!data || data.length === 0) {
    return { error: "That reservation was not found." };
  }
  refresh(reservationId);
  if (decision === "approved") {
    return { ok: `Approved. Reference number ${data[0].reference_no}.` };
  }
  return { ok: decision === "rejected" ? "Rejected. The resident will see the reason." : "Cancelled." };
}

// Confirm a proof the resident sent (FR-20). The amount can be corrected to
// what was really received.
export async function recordSubmittedPayment(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");
  const reservationId = Number(formData.get("reservation_id"));
  const paymentId = Number(formData.get("payment_id"));
  const amount = Number(formData.get("amount"));
  if (!(amount > 0)) {
    return { error: "Type the amount received." };
  }
  const supabase = await getServerSupabase();
  const { error } = await supabase
    .from("payments")
    .update({ status: "recorded", amount })
    .eq("payment_id", paymentId)
    .eq("status", "submitted");
  if (error) {
    return { error: friendlyError(error) };
  }
  refresh(reservationId);
  return { ok: "Payment recorded." };
}

// Record a payment the administrator received directly, usually cash.
export async function recordNewPayment(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");
  const reservationId = Number(formData.get("reservation_id"));
  const kind = String(formData.get("kind"));
  const method = String(formData.get("method"));
  const amount = Number(formData.get("amount"));
  const paidOn = String(formData.get("paid_on") ?? "");
  if (!["fee", "deposit"].includes(kind) || !["cash", "e-wallet"].includes(method)) {
    return { error: "Choose what the payment is for and how it was paid." };
  }
  if (!(amount > 0)) {
    return { error: "Type the amount received." };
  }
  if (!isValidDate(paidOn)) {
    return { error: "Choose the date the payment was received." };
  }

  const supabase = await getServerSupabase();
  const { error } = await supabase.from("payments").insert({
    reservation_id: reservationId,
    kind,
    method,
    amount,
    status: "recorded",
    // Noon, so the date is the same day in any time zone.
    paid_at: manilaToIso(paidOn, "12:00"),
  });
  if (error) {
    return { error: friendlyError(error) };
  }
  refresh(reservationId);
  return { ok: "Payment recorded." };
}

// A wrong payment is voided with a reason. It is never deleted.
export async function voidPayment(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");
  const reservationId = Number(formData.get("reservation_id"));
  const paymentId = Number(formData.get("payment_id"));
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) {
    return { error: "Write why this payment is void." };
  }
  const supabase = await getServerSupabase();
  const { error } = await supabase
    .from("payments")
    .update({ status: "void", void_reason: reason })
    .eq("payment_id", paymentId);
  if (error) {
    return { error: friendlyError(error) };
  }
  refresh(reservationId);
  return { ok: "Payment marked void." };
}

// Equipment handed out, and later returned with its condition (FR-21).
export async function markEquipment(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");
  const reservationId = Number(formData.get("reservation_id"));
  const lineId = Number(formData.get("line_id"));
  const step = String(formData.get("step"));
  const condition = String(formData.get("return_condition") ?? "").trim();
  const now = new Date().toISOString();

  let change: Record<string, string>;
  if (step === "lent") {
    change = { lent_at: now };
  } else if (step === "returned") {
    if (!condition) {
      return { error: "Write the condition of the equipment on return." };
    }
    change = { returned_at: now, return_condition: condition };
  } else {
    return { error: "Unknown step." };
  }

  const supabase = await getServerSupabase();
  const { error } = await supabase.from("reservation_equipment").update(change).eq("id", lineId);
  if (error) {
    return { error: friendlyError(error) };
  }
  refresh(reservationId);
  return { ok: step === "lent" ? "Marked as lent." : "Marked as returned." };
}
