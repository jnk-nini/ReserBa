import type { Metadata } from "next";
import Link from "next/link";
import AvailabilityCalendar from "@/components/availability-calendar";
import PageHeader from "@/components/page-header";
import { requireRole } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase-server";
import type { Amenity } from "@/lib/types";

export const metadata: Metadata = {
  title: "Calendar | ReserBa",
};

export default async function CalendarPage() {
  const user = await requireRole("resident", "admin");
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("amenities")
    .select("*")
    .eq("is_active", true)
    .order("name");
  const amenities = (data ?? []) as Amenity[];
  const isAdmin = user.role === "admin";
  const canBook = isAdmin || user.residency_status === "verified";

  return (
    <>
      <PageHeader
        title="Availability calendar"
        description="Pick an amenity to see which hours are taken and which are free."
      >
        {canBook && (
          <Link href={isAdmin ? "/admin/walk-in" : "/book"} className="btn btn-primary">
            {isAdmin ? "Encode a walk-in" : "Book an amenity"}
          </Link>
        )}
      </PageHeader>
      <AvailabilityCalendar amenities={amenities} canBook={canBook && !isAdmin} />
    </>
  );
}
