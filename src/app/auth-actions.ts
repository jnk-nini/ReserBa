"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase-server";
import type { FormState } from "@/lib/types";

// Server actions for logging in and out and for a forgotten password.
// Passwords are checked and stored (hashed) by Supabase Auth, never by us.

export async function logIn(_state: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Type your email and password." };
  }

  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.toLowerCase().includes("not confirmed")) {
      return { error: "Please open the confirmation link we sent to your email first." };
    }
    if (error.status === 429) {
      return { error: "Too many attempts. Please wait a few minutes and try again." };
    }
    return { error: "The email or password is not correct." };
  }
  redirect("/home");
}

export async function logOut() {
  const supabase = await getServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}

// Sends the "reset your password" email. The answer is the same whether or not
// the email has an account, so nobody can use this form to find out who is
// registered.
export async function requestPasswordReset(_state: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Type the email you signed up with." };
  }
  const origin = (await headers()).get("origin") ?? "";
  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  if (error?.status === 429) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }
  return { ok: "If that email has an account, a link to set a new password is on its way. Open it on this device." };
}

export async function setNewPassword(_state: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");
  if (password.length < 8) {
    return { error: "The password needs at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "The two passwords do not match." };
  }
  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "We could not save the new password. Open the link in the email again and retry." };
  }
  redirect("/home");
}
