import { createBrowserClient } from "@supabase/ssr";
import { sessionCookieOptions } from "./cookie-options";

// Reads the project address and public key from .env.local (or Vercel settings).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabaseKeys() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// The client for code that runs in the browser (forms, the calendar, uploads).
// It keeps the login in cookies, so the server pages see the same signed-in
// user. Calling it many times is fine: it hands back the same client.
export function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase keys are missing. Check .env.local.");
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey, { cookieOptions: sessionCookieOptions });
}
