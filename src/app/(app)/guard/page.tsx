import type { Metadata } from "next";
import Icon from "@/components/icons";
import EmptyState from "@/components/empty-state";
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
        <h2 className="mb-3 text-lg font-semibold">Check a reference number</h2>
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
              className="input min-h-12 font-mono text-lg tracking-wide uppercase"
            />
          </label>
          <button type="submit" className="btn btn-primary">
            Check
          </button>
        </form>

        {reference && <Verdict reference={reference} found={found} />}
      </section>

      <h2 className="mb-3 text-sm font-medium text-ink-soft">Approved reservations today</h2>
      {today.length === 0 ? (
        <EmptyState icon="gate" title="No reservations today">Nothing is approved for today yet.</EmptyState>
      ) : (
        <ul className="panel-flush flex flex-col divide-y divide-line">
          {today.map((row) => (
            <li key={row.reference_no} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="number text-lg font-semibold">
                  {formatTime(row.start_at)} to {formatTime(row.end_at)}
                </p>
                <p className="text-base">
                  {row.amenity_name} · {row.booked_by}
                </p>
              </div>
              <p className="font-mono text-lg font-semibold tracking-wide">{row.reference_no}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// The answer to a reference number check, in one clear sentence. It is read
// at a glance in daylight, so the answer is large and carries an icon as well
// as a colour.
function Verdict({ reference, found }: { reference: string; found?: Found }) {
  if (!found) {
    return (
      <VerdictCard tone="error" icon="close" title="Not found">
        There is no reservation with the number {reference}.
      </VerdictCard>
    );
  }
  const when = `${formatDate(found.start_at)}, ${formatTime(found.start_at)} to ${formatTime(found.end_at)}`;
  if (found.status !== "approved") {
    return (
      <VerdictCard tone="error" icon="close" title="Not approved">
        {reference} is {found.status}. Do not admit.
      </VerdictCard>
    );
  }
  if (!found.is_today) {
    return (
      <VerdictCard tone="info" icon="alert" title="Not today">
        {reference} is approved for {when} ({found.amenity_name}, {found.booked_by}).
      </VerdictCard>
    );
  }
  return (
    <VerdictCard tone="ok" icon="check" title="Valid for today">
      <span className="number block">
        {found.amenity_name} · {when}
      </span>
      <span className="block">Reserved for {found.booked_by}</span>
    </VerdictCard>
  );
}

function VerdictCard({
  tone,
  icon,
  title,
  children,
}: {
  tone: "ok" | "error" | "info";
  icon: "check" | "close" | "alert";
  title: string;
  children: React.ReactNode;
}) {
  const colours = {
    ok: "border-approved/30 bg-approved-tint text-approved",
    error: "border-refused/30 bg-refused-tint text-refused",
    info: "border-pending/30 bg-pending-tint text-pending",
  }[tone];
  return (
    <div role="status" className={`mt-5 flex items-start gap-4 rounded-xl border p-5 ${colours}`}>
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-current/15">
        <Icon name={icon} className="size-6" />
      </span>
      <div>
        <p className="text-2xl font-semibold tracking-tight">{title}</p>
        <p className="mt-1 text-base">{children}</p>
      </div>
    </div>
  );
}
