import type { Metadata } from "next";
import Link from "next/link";
import BookingForm from "@/components/booking-form";
import PageHeader from "@/components/page-header";
import { requireRole } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase-server";
import { isValidDate } from "@/lib/time";
import type { Amenity, Equipment } from "@/lib/types";

export const metadata: Metadata = {
  title: "Book an amenity | ReserBa",
};

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const user = await requireRole("resident");
  const params = await searchParams;

  if (user.residency_status !== "verified") {
    return (
      <>
        <PageHeader title="Book an amenity" />
        <p className="notice notice-info">
          Only verified residents can book. Your account is {user.residency_status}.{" "}
          <Link href="/account" className="font-semibold underline underline-offset-4">
            Go to your account
          </Link>
        </p>
      </>
    );
  }

  const supabase = await getServerSupabase();
  const [amenityResult, equipmentResult] = await Promise.all([
    supabase.from("amenities").select("*").eq("is_active", true).order("name"),
    supabase.from("equipment").select("*").gt("total_quantity", 0).order("name"),
  ]);
  const amenities = (amenityResult.data ?? []) as Amenity[];
  const equipment = (equipmentResult.data ?? []) as Equipment[];

  const date = typeof params.date === "string" && isValidDate(params.date) ? params.date : undefined;
  const start = typeof params.start === "string" && /^\d{2}:\d{2}$/.test(params.start) ? params.start : undefined;

  return (
    <>
      <PageHeader
        title="Book an amenity"
        description="Choose the amenity and time. You will see right away if the time is free."
      />
      {amenities.length === 0 ? (
        <p className="notice notice-info">No amenity is open for booking yet.</p>
      ) : (
        <BookingForm
          amenities={amenities}
          equipment={equipment}
          initial={{ amenityId: Number(params.amenity) || undefined, date, start }}
        />
      )}
    </>
  );
}
