import type { Metadata } from "next";
import EmptyState from "@/components/empty-state";
import Icon from "@/components/icon";
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
// one reference number. Nothing on this screen changes any record. It is read
// at arm's length at a gate, often in sunlight, so the answer to a check is one
// big, plain verdict: green to admit, red to refuse, amber for "not today".
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

      <section className="panel mb-8">
        <h2 className="mb-3 text-base font-semibold">Check a reference number</h2>
        <form action="/guard" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="label grow">
            <span className="sr-only">Reference number</span>
            <input
              name="ref"
              required
              defaultValue={typed}
              autoComplete="off"
              autoCapitalize="characters"
              inputMode="text"
              placeholder="RB-0013 or just 13"
              className="input min-h-14 font-mono text-xl tracking-wide uppercase"
            />
          </label>
          <button type="submit" className="btn btn-primary btn-large sm:min-w-32">
            Check
          </button>
        </form>

        {reference && <Verdict reference={reference} found={found} />}
      </section>

      <h2 className="mb-3 text-sm font-semibold text-ink-soft">
        Approved reservations today{today.length > 0 && ` (${today.length})`}
      </h2>
      {today.length === 0 ? (
        <EmptyState icon="shield" title="No approved reservation today">
          Approved reservations for today appear here, in time order.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-low">
          {today.map((row) => (
            <li key={row.reference_no} className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <p className="number text-lg font-semibold">
                  {formatTime(row.start_at)} to {formatTime(row.end_at)}
                </p>
                <p className="truncate text-[0.9375rem] text-ink-soft">
                  {row.amenity_name} · {row.booked_by}
                </p>
              </div>
              <p className="shrink-0 rounded-lg bg-ground px-2.5 py-1 font-mono text-base font-semibold tracking-wide">
                {row.reference_no}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// The answer to a reference number check: one big verdict with an icon, so it
// can be read in a glance and does not depend on colour alone.
function Verdict({ reference, found }: { reference: string; found?: Found }) {
  if (!found) {
    return (
      <Card tone="refused" icon="close" title="Not found">
        There is no reservation with the number {reference}.
      </Card>
    );
  }
  const when = `${formatDate(found.start_at)}, ${formatTime(found.start_at)} to ${formatTime(found.end_at)}`;
  if (found.status !== "approved") {
    return (
      <Card tone="refused" icon="close" title="Not approved. Do not admit">
        {reference} is {found.status}.
      </Card>
    );
  }
  if (!found.is_today) {
    return (
      <Card tone="pending" icon="clock" title="Not today">
        {reference} is approved for {when} ({found.amenity_name}, {found.booked_by}).
      </Card>
    );
  }
  return (
    <Card tone="approved" icon="check" title="Valid for today">
      <span className="number block font-medium">
        {found.amenity_name} · {when}
      </span>
      <span className="block">Reserved for {found.booked_by}</span>
    </Card>
  );
}

const tones = {
  approved: { box: "border-approved/25 bg-approved-tint text-approved", dot: "bg-approved" },
  pending: { box: "border-pending/25 bg-pending-tint text-pending", dot: "bg-pending" },
  refused: { box: "border-refused/25 bg-refused-tint text-refused", dot: "bg-refused" },
};

function Card({
  tone,
  icon,
  title,
  children,
}: {
  tone: keyof typeof tones;
  icon: "check" | "close" | "clock";
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" className={`mt-5 flex items-start gap-4 rounded-2xl border p-5 ${tones[tone].box}`}>
      <span className={`flex size-12 shrink-0 items-center justify-center rounded-full text-on-brand ${tones[tone].dot}`}>
        <Icon name={icon} className="size-6" />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-semibold">{title}</p>
        <p className="mt-1 text-[0.9375rem]">{children}</p>
      </div>
    </div>
  );
}
