"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { friendlyError } from "@/lib/errors";
import { getServerSupabase } from "@/lib/supabase-server";
import type { FormState } from "@/lib/types";

// Verify or reject a resident (FR-04). On verify the administrator says whether
// the person is a homeowner or a tenant. On reject the reason is saved in the
// same update, so the resident can read it and the audit log records it.
export async function reviewResident(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");
  const userId = String(formData.get("user_id"));
  const decision = String(formData.get("decision"));
  const residentType = String(formData.get("resident_type") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  let change: Record<string, string | null>;
  if (decision === "verified") {
    if (!["homeowner", "tenant"].includes(residentType)) {
      return { error: "Choose homeowner or tenant." };
    }
    change = { residency_status: "verified", resident_type: residentType, residency_note: null };
  } else if (decision === "rejected") {
    if (!note) {
      return { error: "Write the reason. The resident will see it." };
    }
    change = { residency_status: "rejected", residency_note: note };
  } else {
    return { error: "Choose verify or reject." };
  }

  const supabase = await getServerSupabase();
  const { error } = await supabase.from("users").update(change).eq("user_id", userId).eq("role", "resident");
  if (error) {
    return { error: friendlyError(error) };
  }
  revalidatePath("/admin/residents");
  return { ok: decision === "verified" ? "Verified. This resident can now book." : "Rejected. The resident will see the reason." };
}

// Give an account another role, for example to make a guard account (FR-05).
// The database refuses an administrator changing their own role.
export async function changeRole(_state: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");
  const userId = String(formData.get("user_id"));
  const role = String(formData.get("role"));
  if (!["resident", "guard", "admin"].includes(role)) {
    return { error: "Choose a role." };
  }
  const supabase = await getServerSupabase();
  const { error } = await supabase.from("users").update({ role }).eq("user_id", userId);
  if (error) {
    return { error: friendlyError(error) };
  }
  revalidatePath("/admin/residents");
  return { ok: "Role changed." };
}
