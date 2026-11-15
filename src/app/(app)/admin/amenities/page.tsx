import type { Metadata } from "next";
import Link from "next/link";
import AmenityForm from "@/components/amenity-form";
import PageHeader from "@/components/page-header";
import { requireRole } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { getServerSupabase } from "@/lib/supabase-server";
import { formatClock } from "@/lib/time";
import type { Amenity } from "@/lib/types";

export const metadata: Metadata = {
  title: "Amenities | ReserBa",
};

export default async function AmenitiesPage() {
  await requireRole("admin");
  const supabase = await getServerSupabase();
  const { data } = await supabase.from("amenities").select("*").order("name");
  const amenities = (data ?? []) as Amenity[];

  return (
    <>
      <PageHeader
        title="Amenities"
        description="Hours, rates, deposit, and buffer time of each amenity. Open one to edit it or to block dates."
      />

      {amenities.length > 0 && (
        <div className="table-wrap mb-8">
          <table className="table number">
            <thead>
              <tr>
                <th>Amenity</th>
                <th>Hours</th>
                <th className="text-right">Buffer</th>
                <th className="text-right">Resident</th>
                <th className="text-right">Non-resident</th>
                <th className="text-right">Deposit</th>
                <th>Booking</th>
              </tr>
            </thead>
            <tbody>
              {amenities.map((amenity) => (
                <tr key={amenity.amenity_id}>
                  <td>
                    <Link
                      href={`/admin/amenities/${amenity.amenity_id}`}
                      className="font-semibold text-brand underline underline-offset-4"
                    >
                      {amenity.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap">
                    {formatClock(amenity.open_time)} to {formatClock(amenity.close_time)}
                  </td>
                  <td className="text-right">{amenity.buffer_minutes} min</td>
                  <td className="text-right">{formatMoney(amenity.rate_resident)}/hr</td>
                  <td className="text-right">{formatMoney(amenity.rate_nonresident)}/hr</td>
                  <td className="text-right">{formatMoney(amenity.deposit)}</td>
                  <td>{amenity.is_active ? "Open" : "Closed"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className="panel max-w-2xl">
        <h2 className="mb-4 text-lg font-bold">Add an amenity</h2>
        <AmenityForm />
      </section>
    </>
  );
}
