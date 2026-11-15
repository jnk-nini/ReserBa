"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { friendlyError } from "@/lib/errors";
import { getServerSupabase } from "@/lib/supabase-server";
import { isValidDate } from "@/lib/time";
import type { FormState } from "@/lib/types";

// The amenity fund ledger (FR-22). Income is written by the database when a
// fee payment is recorded; here the administrator only types expenses.
export async function addExpense(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");
  const amount = Number(formData.get("amount"));
  const entryDate = String(formData.get("entry_date") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const amenityId = Number(formData.get("amenity_id")) || null;
  if (!(amount > 0)) {
    return { error: "Type the amount spent." };
  }
  if (!isValidDate(entryDate)) {
    return { error: "Choose the date of the expense." };
  }
  if (!description) {
    return { error: "Write what the expense was for." };
  }

  const supabase = await getServerSupabase();
  const { error } = await supabase.from("ledger_entries").insert({
    entry_type: "expense",
    amount,
    entry_date: entryDate,
    description,
    amenity_id: amenityId,
  });
  if (error) {
    return { error: friendlyError(error) };
  }
  revalidatePath("/admin/ledger");
  return { ok: "Expense added." };
}

// A wrong expense is voided with a reason, never deleted. Income is voided by
// voiding its payment on the reservation.
export async function voidExpense(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");
  const entryId = Number(formData.get("entry_id"));
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) {
    return { error: "Write why this entry is void." };
  }
  const supabase = await getServerSupabase();
  const { error } = await supabase
    .from("ledger_entries")
    .update({ is_void: true, void_reason: reason })
    .eq("entry_id", entryId)
    .eq("entry_type", "expense");
  if (error) {
    return { error: friendlyError(error) };
  }
  revalidatePath("/admin/ledger");
  return { ok: "Entry marked void." };
}
