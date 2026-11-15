"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { friendlyError } from "@/lib/errors";
import { getServerSupabase } from "@/lib/supabase-server";
import type { FormState } from "@/lib/types";

// A person may correct their own name, contact number, and address. The
// database refuses any attempt to change the role or residency status here.
export async function saveProfile(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const contactNo = String(formData.get("contact_no") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  if (!fullName) {
    return { error: "Your name cannot be empty." };
  }

  const supabase = await getServerSupabase();
  const { error } = await supabase
    .from("users")
    .update({ full_name: fullName, contact_no: contactNo || null, address: address || null })
    .eq("user_id", user.user_id);
  if (error) {
    return { error: friendlyError(error) };
  }
  revalidatePath("/account");
  return { ok: "Saved." };
}
