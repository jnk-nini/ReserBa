import type { Metadata } from "next";
import ExportButtons, { type ReportTable } from "@/components/export-buttons";
import MonthPicker from "@/components/month-picker";
import PageHeader from "@/components/page-header";
import { requireRole } from "@/lib/auth";
import { formatMoney, sumMoney } from "@/lib/money";
import { getServerSupabase } from "@/lib/supabase-server";
import { formatDate, formatMonth, formatTime, isValidMonth, monthBounds, todayInManila } from "@/lib/time";

export const metadata: Metadata = {
  title: "Reports | ReserBa",
};

type BookingRow = {
  reservation_id: number;
  reference_no: string | null;
  start_at: string;
  end_at: string;
  status: string;
  total_fee: number;
  guest_name: string | null;
  amenities: { name: string } | null;
  booker: { full_name: string } | null;
};

type PaymentRow = {
  payment_id: number;
  kind: "fee" | "deposit";
  method: string;
  amount: number;
  paid_at: string;
  reservations: { reference_no: string | null; reservation_id: number; amenities: { name: string } | null } | null;
};

type ExpenseRow = {
  entry_id: number;
  entry_date: string;
  amount: number;
  description: string | null;
  amenities: { name: string } | null;
};

const statuses = ["pending", "approved", "rejected", "cancelled"];

// Monthly reports (FR-24, FR-25): bookings per amenity, and money in and out.
// Every total is added up from the rows listed under it, so the totals always
// equal the sum of the rows.
export default async function ReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  await requireRole("admin");
  const params = await searchParams;
  const month =
    typeof params.month === "string" && isValidMonth(params.month) ? params.month : todayInManila().slice(0, 7);
  const bounds = monthBounds(month);

  const supabase = await getServerSupabase();
  const [bookingResult, paymentResult, expenseResult] = await Promise.all([
    supabase
      .from("reservations")
      .select(
        "reservation_id, reference_no, start_at, end_at, status, total_fee, guest_name, amenities(name), booker:users!reservations_user_id_fkey(full_name)",
      )
      .gte("start_at", bounds.start)
      .lt("start_at", bounds.end)
      .order("start_at"),
    supabase
      .from("payments")
      .select("payment_id, kind, method, amount, paid_at, reservations(reference_no, reservation_id, amenities(name))")
      .eq("status", "recorded")
      .gte("paid_at", bounds.start)
      .lt("paid_at", bounds.end)
      .order("paid_at"),
    supabase
      .from("ledger_entries")
      .select("entry_id, entry_date, amount, description, amenities(name)")
      .eq("entry_type", "expense")
      .eq("is_void", false)
      .gte("entry_date", bounds.firstDay)
      .lt("entry_date", bounds.nextFirstDay)
      .order("entry_date"),
  ]);
  const bookings = (bookingResult.data ?? []) as unknown as BookingRow[];
  const payments = (paymentResult.data ?? []) as unknown as PaymentRow[];
  const expenses = (expenseResult.data ?? []) as unknown as ExpenseRow[];

  // Booking report: one line per amenity with a count for each status.
  const amenityNames = [...new Set(bookings.map((row) => row.amenities?.name ?? "Unknown"))].sort();
  const perAmenity = amenityNames.map((name) => {
    const rows = bookings.filter((row) => (row.amenities?.name ?? "Unknown") === name);
    const counts = statuses.map((status) => rows.filter((row) => row.status === status).length);
    return [name, ...counts, rows.length] as Array<string | number>;
  });
  const statusTotals = statuses.map((status) => bookings.filter((row) => row.status === status).length);

  const feeIncome = sumMoney(payments.filter((row) => row.kind === "fee").map((row) => row.amount));
  const depositsHeld = sumMoney(payments.filter((row) => row.kind === "deposit").map((row) => row.amount));
  const expenseTotal = sumMoney(expenses.map((row) => row.amount));

  const bookingTables: ReportTable[] = [
    {
      title: "Bookings per amenity",
      columns: ["Amenity", "Waiting", "Approved", "Rejected", "Cancelled", "Total"],
      rows: perAmenity,
      totals: ["All amenities", ...statusTotals, bookings.length],
    },
    {
      title: "List of bookings",
      columns: ["Date", "Time", "Amenity", "Reserved for", "Status", "Reference", "Fee (pesos)"],
      rows: bookings.map((row) => [
        formatDate(row.start_at),
        `${formatTime(row.start_at)} to ${formatTime(row.end_at)}`,
        row.amenities?.name ?? "",
        row.guest_name ?? row.booker?.full_name ?? "",
        row.status,
        row.reference_no ?? "",
        Number(row.total_fee),
      ]),
      moneyColumns: [6],
    },
  ];

  const moneyTables: ReportTable[] = [
    {
      title: "Summary",
      columns: ["Item", "Amount (pesos)"],
      rows: [
        ["Income from reservation fees", feeIncome],
        ["Expenses", expenseTotal],
        ["Income less expenses", feeIncome - expenseTotal],
        ["Security deposits received (held, not income)", depositsHeld],
      ],
      moneyColumns: [1],
    },
    {
      title: "Payments received",
      columns: ["Date", "Reference", "Amenity", "For", "Paid by", "Amount (pesos)"],
      rows: payments.map((row) => [
        formatDate(row.paid_at),
        row.reservations?.reference_no ?? `Request #${row.reservations?.reservation_id}`,
        row.reservations?.amenities?.name ?? "",
        row.kind === "fee" ? "Fee" : "Deposit",
        row.method,
        Number(row.amount),
      ]),
      totals: ["Total", "", "", "", "", sumMoney(payments.map((row) => row.amount))],
      moneyColumns: [5],
    },
    {
      title: "Expenses",
      columns: ["Date", "What for", "Amenity", "Amount (pesos)"],
      rows: expenses.map((row) => [
        formatDate(row.entry_date),
        row.description ?? "",
        row.amenities?.name ?? "General",
        Number(row.amount),
      ]),
      totals: ["Total", "", "", expenseTotal],
      moneyColumns: [3],
    },
  ];

  return (
    <>
      <PageHeader title="Monthly reports" description={formatMonth(month)}>
        <MonthPicker month={month} action="/admin/reports" />
      </PageHeader>

      <section className="mb-10 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Booking report</h2>
          <ExportButtons
            fileName={`reserba-bookings-${month}`}
            heading={`ReserBa booking report, ${formatMonth(month)}`}
            tables={bookingTables}
          />
        </div>
        {bookingTables.map((table) => (
          <ReportTableView key={table.title} table={table} />
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Income and expense report</h2>
          <ExportButtons
            fileName={`reserba-income-expense-${month}`}
            heading={`ReserBa income and expense report, ${formatMonth(month)}`}
            tables={moneyTables}
          />
        </div>
        {moneyTables.map((table) => (
          <ReportTableView key={table.title} table={table} />
        ))}
      </section>
    </>
  );
}

// Draws one report table on screen, from the same data the export uses.
function ReportTableView({ table }: { table: ReportTable }) {
  const money = table.moneyColumns ?? [];
  const cell = (value: string | number, column: number) =>
    typeof value === "number" && money.includes(column) ? formatMoney(value) : value;
  const align = (value: string | number) => (typeof value === "number" ? "text-right" : "");

  return (
    <div>
      <h3 className="mb-2 text-base font-bold">{table.title}</h3>
      {table.rows.length === 0 ? (
        <p className="panel text-base text-ink-soft">Nothing in this month.</p>
      ) : (
        <div className="table-wrap">
          <table className="table number">
            <thead>
              <tr>
                {table.columns.map((column, index) => (
                  <th key={column} className={align(table.rows[0][index])}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((value, column) => (
                    <td key={column} className={align(value)}>
                      {cell(value, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {table.totals && (
              <tfoot>
                <tr className="bg-brand-tint font-bold">
                  {table.totals.map((value, column) => (
                    <td key={column} className={align(value)}>
                      {cell(value, column)}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
