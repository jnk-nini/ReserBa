import type { Metadata } from "next";
import Link from "next/link";
import EmptyState from "@/components/empty-state";
import Icon from "@/components/icon";
import PageHeader from "@/components/page-header";
import { requireRole } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase-server";
import { addDays, formatDate, formatTime, manilaToIso, todayInManila } from "@/lib/time";

export const metadata: Metadata = {
  title: "Dashboard | ReserBa",
};

type TodayRow = {
  reservation_id: number;
  reference_no: string | null;
  start_at: string;
  end_at: string;
  guest_name: string | null;
  amenities: { name: string } | null;
  booker: { full_name: string } | null;
};

// The administrator's first screen (FR-30): what is waiting for a decision,
// and who is using the amenities today.
export default async function AdminDashboardPage() {
  await requireRole("admin");
  const supabase = await getServerSupabase();
  const today = todayInManila();
  const dayStart = manilaToIso(today, "00:00");
  const dayEnd = manilaToIso(addDays(today, 1), "00:00");

  const [requests, residents, payments, todayResult] = await Promise.all([
    supabase.from("reservations").select("reservation_id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("users")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "resident")
      .eq("residency_status", "pending"),
    supabase.from("payments").select("payment_id", { count: "exact", head: true }).eq("status", "submitted"),
    supabase
      .from("reservations")
      .select(
        "reservation_id, reference_no, start_at, end_at, guest_name, amenities(name), booker:users!reservations_user_id_fkey(full_name)",
      )
      .eq("status", "approved")
      .lt("start_at", dayEnd)
      .gt("end_at", dayStart)
      .order("start_at"),
  ]);
  const todayRows = (todayResult.data ?? []) as unknown as TodayRow[];

  const waiting = [
    { count: requests.count ?? 0, label: "reservation requests to decide", href: "/admin/requests" },
    { count: residents.count ?? 0, label: "residents to verify", href: "/admin/residents" },
    { count: payments.count ?? 0, label: "payment proofs to check", href: "/admin/requests?show=payments" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description={formatDate(new Date())} />

      <section aria-labelledby="waiting-title">
        <h2 id="waiting-title" className="mb-3 text-sm font-semibold text-ink-soft">
          Waiting for you
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {waiting.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex h-full flex-col justify-between gap-6 rounded-2xl border border-line bg-surface p-5 shadow-low transition-[border-color,box-shadow,transform] duration-200 ease-settle hover:-translate-y-0.5 hover:border-line-strong hover:shadow-high"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="text-[0.9375rem] text-ink-soft">{item.label}</span>
                  <Icon
                    name="chevron-right"
                    className="mt-1 size-4 text-ink-soft/50 transition-transform duration-200 ease-settle group-hover:translate-x-0.5"
                  />
                </span>
                <span className="flex items-center gap-2.5">
                  <span
                    className={`number text-4xl leading-none font-semibold tracking-tight ${item.count > 0 ? "text-ink" : "text-ink-soft/60"}`}
                  >
                    {item.count}
                  </span>
                  {item.count > 0 && <span className="size-2 rounded-full bg-pending" aria-label="needs attention" />}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="today-title" className="mt-8">
        <h2 id="today-title" className="mb-3 text-sm font-semibold text-ink-soft">
          Approved for today
        </h2>
        {todayRows.length === 0 ? (
          <EmptyState icon="calendar" title="Nothing booked today">Approved reservations for today appear here.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table number">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Amenity</th>
                  <th>Reserved for</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {todayRows.map((row) => (
                  <tr key={row.reservation_id}>
                    <td className="whitespace-nowrap">
                      {formatTime(row.start_at)} to {formatTime(row.end_at)}
                    </td>
                    <td>{row.amenities?.name}</td>
                    <td>{row.guest_name ?? row.booker?.full_name}</td>
                    <td>
                      <Link
                        href={`/admin/requests/${row.reservation_id}`}
                        className="font-mono font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
                      >
                        {row.reference_no}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
