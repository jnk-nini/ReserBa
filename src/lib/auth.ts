import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getServerSupabase } from "./supabase-server";
import type { Role, UserRow } from "./types";

// Who is signed in? Returns their row from the users table, or null.
// "cache" makes several components on one page share a single lookup.
export const getCurrentUser = cache(async (): Promise<UserRow | null> => {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  const { data } = await supabase
    .from("users")
    .select(
      "user_id, full_name, email, contact_no, address, role, resident_type, residency_status, proof_of_residency_url, residency_note, created_at",
    )
    .eq("user_id", user.id)
    .maybeSingle();
  return data as UserRow | null;
});

// For pages that need a signed-in person.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

// For pages that belong to one role. Anyone else is sent to their own home.
// This only keeps people out of screens that are not theirs. The database
// refuses the data itself through Row Level Security.
export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/home");
  }
  return user;
}

export function homePathFor(role: Role) {
  if (role === "admin") return "/admin";
  if (role === "guard") return "/guard";
  return "/calendar";
}
