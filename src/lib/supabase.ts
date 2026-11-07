import { createClient } from "@supabase/supabase-js";

// Reads the project address and public key from .env.local (or Vercel settings).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabaseKeys() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Use this client anywhere in the app to talk to the database.
export function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase keys are missing. Check .env.local.");
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}
