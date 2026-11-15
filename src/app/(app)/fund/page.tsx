import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { requireRole } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { getServerSupabase } from "@/lib/supabase-server";
import { formatMonth } from "@/lib/time";

export const metadata: Metadata = {
  title: "Fund summary | ReserBa",
};

type MonthRow = { month: string; income: number; expense: number };

// The read-only amenity fund summary for residents (FR-23): monthly totals
// only, from the "fund_summary" view. Individual entries stay with the HOA.
export default async function FundPage() {
  await requireRole("resident", "admin");
  const supabase = await getServerSupabase();
  const { data } = await supabase.from("fund_summary").select("*").order("month", { ascending: false }).limit(24);
  const rows = (data ?? []) as MonthRow[];

  return (
    <>
      <PageHeader
        title="Amenity fund summary"
        description="Money received from amenity fees and money spent on the amenities, by month. This is a monitoring summary and not the official books of the association."
      />
      {rows.length === 0 ? (
        <p className="panel text-base text-ink-soft">Nothing has been recorded yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="table number">
            <thead>
              <tr>
                <th>Month</th>
                <th className="text-right">Income</th>
                <th className="text-right">Expenses</th>
                <th className="text-right">Difference</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.month}>
                  <td>{formatMonth(row.month.slice(0, 7))}</td>
                  <td className="text-right">{formatMoney(row.income)}</td>
                  <td className="text-right">{formatMoney(row.expense)}</td>
                  <td className="text-right font-semibold">{formatMoney(Number(row.income) - Number(row.expense))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
