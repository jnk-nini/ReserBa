import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

// The links in Supabase's emails (confirm your email, reset your password)
// come back here with a one-time code. It is exchanged for a login, then the
// person continues to the page named in "next".
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";
  // Only paths inside this site, so the link cannot send people elsewhere.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/home";

  if (code) {
    const supabase = await getServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // The code is missing, used, or was opened in a different browser than the
  // one that asked for it. A confirmed email still counts, so logging in works.
  return NextResponse.redirect(`${origin}/login?notice=link`);
}
