"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { friendlyError } from "@/lib/errors";
import { getServerSupabase } from "@/lib/supabase-server";
import { isValidDate, manilaToIso } from "@/lib/time";
import type { FormState } from "@/lib/types";

// Amenities, their rates and hours (FR-06), and blocked dates (FR-07).

export async function saveAmenity(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");
  const amenityId = Number(formData.get("amenity_id")) || null;
  const name = String(formData.get("name") ?? "").trim();
  const openTime = String(formData.get("open_time") ?? "");
  const closeTime = String(formData.get("close_time") ?? "");
  const values = {
    name,
    type: String(formData.get("type") ?? "other"),
    open_time: openTime,
    close_time: closeTime,
    buffer_minutes: Math.floor(Number(formData.get("buffer_minutes"))),
    rate_resident: Number(formData.get("rate_resident")),
    rate_nonresident: Number(formData.get("rate_nonresident")),
    deposit: Number(formData.get("deposit")),
    is_active: formData.get("is_active") === "on",
  };

  if (!name) {
    return { error: "Type the name of the amenity." };
  }
  if (!openTime || !closeTime || closeTime <= openTime) {
    return { error: "The closing time must be later than the opening time." };
  }
  const numbers = [values.buffer_minutes, values.rate_resident, values.rate_nonresident, values.deposit];
  if (numbers.some((value) => Number.isNaN(value) || value < 0)) {
    return { error: "The buffer, rates, and deposit must be 0 or more." };
  }

  const supabase = await getServerSupabase();
  if (amenityId) {
    const { error } = await supabase.from("amenities").update(values).eq("amenity_id", amenityId);
    if (error) {
      return { error: friendlyError(error) };
    }
    revalidatePath(`/admin/amenities/${amenityId}`);
    return { ok: "Saved. New rates and hours apply to new requests only." };
  }

  const { data, error } = await supabase.from("amenities").insert(values).select("amenity_id").single();
  if (error) {
    return { error: friendlyError(error) };
  }
  redirect(`/admin/amenities/${data.amenity_id}`);
}

// Block a range for the HOA's own use. The database refuses a block that
// covers an approved reservation and says which one.
export async function addBlockedDate(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("admin");
  const amenityId = Number(formData.get("amenity_id"));
  const date = String(formData.get("date") ?? "");
  const endDate = String(formData.get("end_date") ?? "") || date;
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!isValidDate(date) || !isValidDate(endDate) || !start || !end) {
    return { error: "Choose the date and the start and end time." };
  }
  if (!reason) {
    return { error: "Write the reason, for example HOA assembly." };
  }
  const startAt = manilaToIso(date, start);
  const endAt = manilaToIso(endDate, end);
  if (new Date(endAt) <= new Date(startAt)) {
    return { error: "The end must be later than the start." };
  }

  const supabase = await getServerSupabase();
  const { error } = await supabase.from("blocked_dates").insert({
    amenity_id: amenityId,
    start_at: startAt,
    end_at: endAt,
    reason,
    created_by: user.user_id,
  });
  if (error) {
    return { error: friendlyError(error) };
  }
  revalidatePath(`/admin/amenities/${amenityId}`);
  return { ok: "Blocked. Requests waiting in that time can now only be rejected." };
}

export async function removeBlockedDate(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");
  const amenityId = Number(formData.get("amenity_id"));
  const blockId = Number(formData.get("block_id"));
  const supabase = await getServerSupabase();
  const { error } = await supabase.from("blocked_dates").delete().eq("block_id", blockId);
  if (error) {
    return { error: friendlyError(error) };
  }
  revalidatePath(`/admin/amenities/${amenityId}`);
  return { ok: "Removed." };
}
