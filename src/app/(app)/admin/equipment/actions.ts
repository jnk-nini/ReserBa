"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { friendlyError } from "@/lib/errors";
import { getServerSupabase } from "@/lib/supabase-server";
import type { FormState } from "@/lib/types";

// The equipment inventory (FR-08): items the association lends with a
// reservation, how many it owns, the rental rate, and the condition.
export async function saveEquipment(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");
  const equipmentId = Number(formData.get("equipment_id")) || null;
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    total_quantity: Math.floor(Number(formData.get("total_quantity"))),
    rate: Number(formData.get("rate")),
    condition: String(formData.get("condition") ?? "").trim() || null,
  };
  if (!values.name) {
    return { error: "Type the name of the item." };
  }
  if (!(values.total_quantity >= 0) || !(values.rate >= 0)) {
    return { error: "The quantity and the rate must be 0 or more." };
  }

  const supabase = await getServerSupabase();
  const { error } = equipmentId
    ? await supabase.from("equipment").update(values).eq("equipment_id", equipmentId)
    : await supabase.from("equipment").insert(values);
  if (error) {
    return { error: friendlyError(error) };
  }
  revalidatePath("/admin/equipment");
  return { ok: equipmentId ? "Saved." : "Added." };
}
