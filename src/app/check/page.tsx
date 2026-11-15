import { Suspense } from "react";
import { connection } from "next/server";
import { hasSupabaseKeys } from "@/lib/supabase";

async function checkConnection() {
  if (!hasSupabaseKeys()) {
    return { ok: false, message: "The Supabase keys are missing. Fill in .env.local." };
  }
  try {
    // Asks the Supabase login service for its settings. This works with the
    // public key alone and needs no tables, so it is a safe first test.
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
      cache: "no-store",
    });
    if (response.ok) {
      return { ok: true, message: "Connected to Supabase." };
    }
    return {
      ok: false,
      message: `Supabase answered with an error (status ${response.status}). Check the URL and key.`,
    };
  } catch {
    return { ok: false, message: "Could not reach Supabase. Check the URL and your internet." };
  }
}

// Shows the result of the check, run fresh on every visit.
async function Result() {
  // Waits for a real visit, so the answer is never an old, saved one.
  await connection();
  const result = await checkConnection();
  return (
    <p
      className={`notice ${result.ok ? "notice-ok" : "notice-error"}`}
    >
      {result.message}
    </p>
  );
}

export default function CheckPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold">Connection check</h1>
      <Suspense fallback={<p className="text-base text-ink-soft">Checking...</p>}>
        <Result />
      </Suspense>
    </main>
  );
}
