import type { Metadata } from "next";
import BookingForm from "@/components/booking-form";
import PageHeader from "@/components/page-header";
import { requireRole } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase-server";
import type { Amenity, Equipment } from "@/lib/types";

export const metadata: Metadata = {
  title: "Walk-in | ReserBa",
};

// Walk-in and guest reservations typed in by the administrator (FR-17).
// It is the same form and the same database function as the resident's
// booking, so the same conflict rules apply. The reservation is saved as
// waiting; the administrator approves it on the next screen.
export default async function WalkInPage() {
  await requireRole("admin");
  const supabase = await getServerSupabase();
  const [amenityResult, equipmentResult, sponsorResult] = await Promise.all([
    supabase.from("amenities").select("*").eq("is_active", true).order("name"),
    supabase.from("equipment").select("*").gt("total_quantity", 0).order("name"),
    supabase
      .from("users")
      .select("user_id, full_name")
      .eq("role", "resident")
      .eq("residency_status", "verified")
      .order("full_name"),
  ]);
  const amenities = (amenityResult.data ?? []) as Amenity[];

  return (
    <>
      <PageHeader
        title="Encode a walk-in or guest reservation"
        description="For a person who reserves at the office. After saving, you approve it and record the payment on the next screen."
      />
      {amenities.length === 0 ? (
        <p className="notice notice-info">Add an amenity first.</p>
      ) : (
        <BookingForm
          walkIn
          amenities={amenities}
          equipment={(equipmentResult.data ?? []) as Equipment[]}
          sponsors={sponsorResult.data ?? []}
        />
      )}
    </>
  );
}
