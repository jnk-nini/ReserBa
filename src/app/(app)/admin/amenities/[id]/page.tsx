import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ActionForm from "@/components/action-form";
import AmenityForm from "@/components/amenity-form";
import PageHeader from "@/components/page-header";
import { requireRole } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase-server";
import { formatDateTime, todayInManila } from "@/lib/time";
import type { Amenity } from "@/lib/types";
import { addBlockedDate, removeBlockedDate } from "../actions";

export const metadata: Metadata = {
  title: "Amenity | ReserBa",
};

type Block = { block_id: number; start_at: string; end_at: string; reason: string };

export default async function AmenityPage({ params }: PageProps<"/admin/amenities/[id]">) {
  await requireRole("admin");
  const { id } = await params;
  const amenityId = Number(id) || 0;
  const supabase = await getServerSupabase();
  const [amenityResult, blockResult] = await Promise.all([
    supabase.from("amenities").select("*").eq("amenity_id", amenityId).maybeSingle(),
    supabase
      .from("blocked_dates")
      .select("block_id, start_at, end_at, reason")
      .eq("amenity_id", amenityId)
      .gt("end_at", new Date().toISOString())
      .order("start_at"),
  ]);
  if (!amenityResult.data) {
    notFound();
  }
  const amenity = amenityResult.data as Amenity;
  const blocks = (blockResult.data ?? []) as Block[];
  const today = todayInManila();

  return (
    <>
      <PageHeader title={amenity.name} back={{ href: "/admin/amenities", label: "Amenities" }} />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className="panel">
          <h2 className="mb-4 text-base font-semibold">Details</h2>
          <AmenityForm amenity={amenity} />
          <p className="mt-4 text-sm text-ink-soft">
            An amenity with reservations is not deleted. Untick &quot;Open for booking&quot; to hide it
            and keep its history.
          </p>
        </section>

        <section className="panel flex flex-col gap-4">
          <h2 className="text-base font-semibold">Blocked dates</h2>
          <p className="text-base text-ink-soft">
            Times the association keeps for itself, such as an assembly or repairs. Nobody can book
            over them.
          </p>

          {blocks.length === 0 ? (
            <p className="text-base text-ink-soft">No upcoming blocked date.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {blocks.map((block) => (
                <li key={block.block_id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-base font-semibold">{block.reason}</p>
                    <p className="number text-sm text-ink-soft">
                      {formatDateTime(block.start_at)} to {formatDateTime(block.end_at)}
                    </p>
                  </div>
                  <ActionForm
                    action={removeBlockedDate}
                    submitLabel="Remove"
                    pendingLabel="Removing..."
                    buttonClass="btn btn-danger btn-small"
                    className="flex flex-col items-end gap-2"
                    confirmMessage="Remove this blocked date? The time becomes bookable again."
                  >
                    <input type="hidden" name="amenity_id" value={amenity.amenity_id} />
                    <input type="hidden" name="block_id" value={block.block_id} />
                  </ActionForm>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-line pt-4">
            <h3 className="mb-3 text-base font-semibold">Block a date</h3>
            <ActionForm action={addBlockedDate} submitLabel="Block this time">
              <input type="hidden" name="amenity_id" value={amenity.amenity_id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="label">
                  From date
                  <input name="date" type="date" required min={today} defaultValue={today} className="input" />
                </label>
                <label className="label">
                  From time
                  <input name="start" type="time" required defaultValue={amenity.open_time.slice(0, 5)} className="input" />
                </label>
                <label className="label">
                  To date
                  <input name="end_date" type="date" min={today} className="input" />
                  <span className="hint">Leave empty for the same day.</span>
                </label>
                <label className="label">
                  To time
                  <input name="end" type="time" required defaultValue={amenity.close_time.slice(0, 5)} className="input" />
                </label>
              </div>
              <label className="label">
                Reason
                <input name="reason" required className="input" placeholder="HOA general assembly" />
              </label>
            </ActionForm>
          </div>
        </section>
      </div>
    </>
  );
}
