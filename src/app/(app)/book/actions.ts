"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { friendlyError } from "@/lib/errors";
import { getServerSupabase } from "@/lib/supabase-server";
import { isValidDate, manilaToIso } from "@/lib/time";
import type { FormState } from "@/lib/types";

// Saves a reservation request. Used by the resident booking form and by the
// administrator walk-in form. The checks that matter (overlap, buffer, blocked
// dates, operating hours, equipment quantity, the fee) are done by the
// database; if it refuses, its reason is shown on the form.
export async function submitReservation(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("resident", "admin");
  const isAdmin = user.role === "admin";

  const amenityId = Number(formData.get("amenity_id"));
  const date = String(formData.get("date") ?? "");
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");
  const timePattern = /^\d{2}:\d{2}$/;
  if (!amenityId || !isValidDate(date) || !timePattern.test(start) || !timePattern.test(end)) {
    return { error: "Choose an amenity, a date, a start time, and an end time." };
  }
  if (end <= start) {
    return { error: "The end time must be later than the start time." };
  }

  // Equipment fields are named equipment_<id> and hold the quantity asked for.
  const equipment: Array<{ equipment_id: number; quantity: number }> = [];
  for (const [name, value] of formData.entries()) {
    if (name.startsWith("equipment_")) {
      const quantity = Math.floor(Number(value));
      if (quantity > 0) {
        equipment.push({ equipment_id: Number(name.slice("equipment_".length)), quantity });
      }
    }
  }

  const guestName = isAdmin ? String(formData.get("guest_name") ?? "").trim() : "";
  const sponsorId = isAdmin ? String(formData.get("sponsor_id") ?? "") : "";
  if (isAdmin && !guestName && !sponsorId) {
    return { error: "Type the guest's name, or choose the resident this booking is for." };
  }

  const supabase = await getServerSupabase();
  const { data, error } = await supabase.rpc("request_reservation", {
    p_amenity_id: amenityId,
    p_start_at: manilaToIso(date, start),
    p_end_at: manilaToIso(date, end),
    p_equipment: equipment,
    p_guest_name: guestName || null,
    p_sponsor_id: sponsorId || null,
  });
  if (error) {
    return { error: friendlyError(error) };
  }

  redirect(isAdmin ? `/admin/requests/${data}` : `/reservations/${data}`);
}
