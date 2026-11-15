import type { Metadata } from "next";
import ActionForm from "@/components/action-form";
import MonthPicker from "@/components/month-picker";
import PageHeader from "@/components/page-header";
import { requireRole } from "@/lib/auth";
import { formatMoney, sumMoney } from "@/lib/money";
import { getServerSupabase } from "@/lib/supabase-server";
import { formatDate, formatMonth, isValidMonth, monthBounds, todayInManila } from "@/lib/time";
import type { Amenity } from "@/lib/types";
import { addExpense, voidExpense } from "./actions";

export const metadata: Metadata = {
  title: "Fund ledger | ReserBa",
};

type Entry = {
  entry_id: number;
  entry_type: "income" | "expense";
  amount: number;
  entry_date: string;
  description: string | null;
  is_void: boolean;
  void_reason: string | null;
  amenities: { name: string } | null;
};

export default async function LedgerPage({ searchParams }: PageProps<"/admin/ledger">) {
  await requireRole("admin");
  const params = await searchParams;
  const today = todayInManila();
  const month = typeof params.month === "string" && isValidMonth(params.month) ? params.month : today.slice(0, 7);
  const bounds = monthBounds(month);

  const supabase = await getServerSupabase();
  const [entryResult, amenityResult] = await Promise.all([
    supabase
      .from("ledger_entries")
      .select("entry_id, entry_type, amount, entry_date, description, is_void, void_reason, amenities(name)")
      .gte("entry_date", bounds.firstDay)
      .lt("entry_date", bounds.nextFirstDay)
      .order("entry_date")
      .order("entry_id"),
    supabase.from("amenities").select("amenity_id, name").order("name"),
  ]);
  const entries = (entryResult.data ?? []) as unknown as Entry[];
  const amenities = (amenityResult.data ?? []) as Pick<Amenity, "amenity_id" | "name">[];

  // Void entries stay on the list but are left out of the totals.
  const counted = entries.filter((entry) => !entry.is_void);
  const income = sumMoney(counted.filter((entry) => entry.entry_type === "income").map((entry) => entry.amount));
  const expense = sumMoney(counted.filter((entry) => entry.entry_type === "expense").map((entry) => entry.amount));

  return (
    <>
      <PageHeader
        title="Amenity fund ledger"
        description="Income from recorded fee payments and the expenses you type in. A monitoring tool, not the association's official books."
      >
        <MonthPicker month={month} action="/admin/ledger" />
      </PageHeader>

      <dl className="number mb-6 grid gap-3 sm:grid-cols-3">
        {[
          ["Income", income],
          ["Expenses", expense],
          ["Difference", income - expense],
        ].map(([label, amount]) => (
          <div key={label} className="glass px-4 py-3">
            <dt className="text-sm text-ink-soft">
              {label}, {formatMonth(month)}
            </dt>
            <dd className="text-2xl font-bold">{formatMoney(amount as number)}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        {entries.length === 0 ? (
          <p className="panel text-base text-ink-soft">No entry in {formatMonth(month)}.</p>
        ) : (
          <div className="table-wrap">
            <table className="table number">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Entry</th>
                  <th className="text-right">Income</th>
                  <th className="text-right">Expense</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.entry_id} className={entry.is_void ? "text-ink-soft line-through decoration-refused" : ""}>
                    <td className="whitespace-nowrap">{formatDate(entry.entry_date)}</td>
                    <td>
                      {entry.description}
                      {entry.amenities && <span className="block text-ink-soft">{entry.amenities.name}</span>}
                      {entry.is_void && <span className="block no-underline">Void: {entry.void_reason}</span>}
                    </td>
                    <td className="text-right">{entry.entry_type === "income" ? formatMoney(entry.amount) : ""}</td>
                    <td className="text-right">{entry.entry_type === "expense" ? formatMoney(entry.amount) : ""}</td>
                    <td className="no-underline">
                      {entry.entry_type === "expense" && !entry.is_void && (
                        <details>
                          <summary className="cursor-pointer font-semibold text-refused">Void</summary>
                          <ActionForm
                            action={voidExpense}
                            submitLabel="Void entry"
                            buttonClass="btn btn-danger btn-small self-start"
                            className="mt-2 flex min-w-44 flex-col gap-2"
                          >
                            <input type="hidden" name="entry_id" value={entry.entry_id} />
                            <label className="label">
                              Reason
                              <input name="reason" required className="input" />
                            </label>
                          </ActionForm>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <section className="panel">
          <h2 className="mb-4 text-lg font-bold">Add an expense</h2>
          <ActionForm action={addExpense} submitLabel="Add expense">
            <label className="label">
              Date
              <input name="entry_date" type="date" required defaultValue={today} max={today} className="input" />
            </label>
            <label className="label">
              Amount (pesos)
              <input name="amount" type="number" inputMode="decimal" min="0.01" step="0.01" required className="input number" />
            </label>
            <label className="label">
              What was it for?
              <input name="description" required className="input" placeholder="Pool cleaning supplies" />
            </label>
            <label className="label">
              Amenity (optional)
              <select name="amenity_id" defaultValue="" className="input">
                <option value="">General</option>
                {amenities.map((amenity) => (
                  <option key={amenity.amenity_id} value={amenity.amenity_id}>
                    {amenity.name}
                  </option>
                ))}
              </select>
            </label>
          </ActionForm>
        </section>
      </div>
    </>
  );
}
