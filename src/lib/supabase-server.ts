import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// The client for code that runs on the server (pages and server actions).
// It reads the login from the visitor's cookies, so every query runs as that
// person and Row Level Security decides what they may see or change.
export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // A page (not an action) cannot write cookies. That is fine: the
            // proxy file refreshes the login cookie on every request.
          }
        },
      },
    },
  );
}
