import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

// Opens an uploaded proof. The buckets are private, so a file is reached only
// through a signed link that stops working after 5 minutes. The link is made
// here, at the moment of the click, for the person who is logged in. The
// storage rules allow it only for the owner of the file and administrators.
//
// Used as /files?bucket=payment-proofs&path=<user id>/<file name>

const buckets = ["residency-proofs", "payment-proofs"];

export async function GET(request: NextRequest) {
  const bucket = request.nextUrl.searchParams.get("bucket") ?? "";
  const path = request.nextUrl.searchParams.get("path") ?? "";
  if (!buckets.includes(bucket) || !path) {
    return new NextResponse("File not found.", { status: 404 });
  }

  const supabase = await getServerSupabase();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 300);
  if (error || !data) {
    return new NextResponse("File not found, or you are not allowed to open it.", { status: 404 });
  }
  return NextResponse.redirect(data.signedUrl);
}
