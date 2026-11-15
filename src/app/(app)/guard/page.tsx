import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { requireRole } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase-server";
import { formatDate, formatTime } from "@/lib/time";

export const metadata: Metadata = {
  title: "Guard | ReserBa",
};

type TodayRow = {
  reference_no: string;
  amenity_name: string;
  start_at: string;
  end_at: string;
  booked_by: string;
};

type Found = TodayRow & { status: string; is_today: boolean };

// The guard view (FR-27, FR-28): today's approved reservations and a check of
// one reference number. Nothing on this screen changes any record.
export default async function GuardPage({ searchParams }: PageProps<"/guard">) {
  await requireRole("guard", "admin");
  const params = await searchParams;
  const typed = typeof params.ref === "string" ? params.ref.trim().toUpperCase() : "";
  // People often type only the digits, so "13" is read as RB-0013.
  const reference = /^\d+$/.test(typed) ? `RB-${typed.padStart(4, "0")}` : typed;

  const supabase = await getServerSupabase();
  const [todayResult, foundResult] = await Promise.all([
    supabase.from("guard_today").select("*").order("start_at"),
    reference
      ? supabase.rpc("guard_find_reservation", { p_reference_no: reference })
      : Promise.resolve({ data: null }),
  ]);
  const today = (todayResult.data ?? []) as TodayRow[];
  const found = ((foundResult.data ?? []) as Found[])[0];

  return (
    <>
      <PageHeader title="Today at the gate" description={formatDate(new Date())} />

      <section className="panel mb-6">
        <h2 className="mb-3 text-lg font-bold">Check a reference number</h2>
        <form action="/guard" className="flex flex-wrap items-end gap-2">
          <label className="label grow">
            Reference number
            <input
              name="ref"
              required
              defaultValue={typed}
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="RB-0013 or just 13"
              className="input font-mono text-lg tracking-wide uppercase"
            />
          </label>
          <button type="submit" className="btn btn-primary">
            Check
          </button>
        </form>

        {reference && <Verdict reference={reference} found={found} />}
      </section>

      <h2 className="mb-3 text-lg font-bold">Approved reservations today</h2>
      {today.length === 0 ? (
        <p className="panel text-base text-ink-soft">No approved reservation today.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-xl border border-line bg-surface">
          {today.map((row) => (
            <li key={row.reference_no} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="number text-lg font-bold">
                  {formatTime(row.start_at)} to {formatTime(row.end_at)}
                </p>
                <p className="text-base">
                  {row.amenity_name} · {row.booked_by}
                </p>
              </div>
              <p className="font-mono text-lg font-bold tracking-wide">{row.reference_no}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// The answer to a reference number check, in one clear sentence.
function Verdict({ reference, found }: { reference: string; found?: Found }) {
  if (!found) {
    return (
      <p role="status" className="notice notice-error mt-4">
        <span className="font-bold">Not found.</span> There is no reservation with the number {reference}.
      </p>
    );
  }
  const when = `${formatDate(found.start_at)}, ${formatTime(found.start_at)} to ${formatTime(found.end_at)}`;
  if (found.status !== "approved") {
    return (
      <p role="status" className="notice notice-error mt-4">
        <span className="font-bold">Not approved.</span> {reference} is {found.status}. Do not admit.
      </p>
    );
  }
  if (!found.is_today) {
    return (
      <p role="status" className="notice notice-info mt-4">
        <span className="font-bold">Not today.</span> {reference} is approved for {when} ({found.amenity_name},{" "}
        {found.booked_by}).
      </p>
    );
  }
  return (
    <div role="status" className="notice notice-ok mt-4">
      <p className="text-lg font-bold">Valid for today.</p>
      <p className="number">
        {found.amenity_name} · {when}
      </p>
      <p>Reserved for {found.booked_by}</p>
    </div>
  );
}
