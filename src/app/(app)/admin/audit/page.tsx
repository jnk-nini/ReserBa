import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { requireRole } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase-server";
import { addDays, formatDateTime, isValidDate, manilaToIso } from "@/lib/time";

export const metadata: Metadata = {
  title: "Audit log | ReserBa",
};

type LogRow = {
  log_id: number;
  action: string;
  table_name: string;
  record_id: string;
  details: { old?: Record<string, unknown>; new?: Record<string, unknown> } | null;
  created_at: string;
  actor: { full_name: string } | null;
};

// The actions people look for most. Others can still be typed in the address.
const actions = [
  "approve_reservation",
  "reject_reservation",
  "cancel_reservation",
  "insert_reservations",
  "record_payment",
  "void_payment",
  "insert_payments",
  "verify_resident",
  "reject_resident",
  "change_user_role",
  "insert_amenities",
  "update_amenities",
  "insert_blocked_dates",
  "delete_blocked_dates",
  "insert_ledger_entries",
  "void_ledger_entry",
  "insert_equipment",
  "update_equipment",
];

function actionLabel(action: string) {
  const words = action.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const pageSize = 50;

// The audit log (FR-26). Read only: the database writes every row by itself
// and refuses any change to them, so this screen has no edit or delete.
export default async function AuditPage({ searchParams }: PageProps<"/admin/audit">) {
  await requireRole("admin");
  const params = await searchParams;
  const from = typeof params.from === "string" && isValidDate(params.from) ? params.from : "";
  const to = typeof params.to === "string" && isValidDate(params.to) ? params.to : "";
  const action = typeof params.action === "string" ? params.action : "";
  const userId = typeof params.user === "string" ? params.user : "";
  const page = Math.max(1, Number(params.page) || 1);

  const supabase = await getServerSupabase();
  let query = supabase
    .from("audit_logs")
    .select("log_id, action, table_name, record_id, details, created_at, actor:users(full_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("log_id", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (from) query = query.gte("created_at", manilaToIso(from, "00:00"));
  if (to) query = query.lt("created_at", manilaToIso(addDays(to, 1), "00:00"));
  if (action) query = query.eq("action", action);
  if (userId) query = query.eq("user_id", userId);

  const [logResult, peopleResult] = await Promise.all([
    query,
    supabase.from("users").select("user_id, full_name").order("full_name"),
  ]);
  const logs = (logResult.data ?? []) as unknown as LogRow[];
  const total = logResult.count ?? 0;
  const people = peopleResult.data ?? [];
  const pages = Math.max(1, Math.ceil(total / pageSize));

  function pageLink(target: number) {
    const search = new URLSearchParams();
    if (from) search.set("from", from);
    if (to) search.set("to", to);
    if (action) search.set("action", action);
    if (userId) search.set("user", userId);
    search.set("page", String(target));
    return `/admin/audit?${search}`;
  }

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Who did what, and when. The database writes this record by itself; nobody can edit or delete it."
      />

      <form action="/admin/audit" className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <label className="label">
          From
          <input name="from" type="date" defaultValue={from} className="input" />
        </label>
        <label className="label">
          To
          <input name="to" type="date" defaultValue={to} className="input" />
        </label>
        <label className="label">
          Action
          <select name="action" defaultValue={action} className="input">
            <option value="">Any action</option>
            {actions.map((name) => (
              <option key={name} value={name}>
                {actionLabel(name)}
              </option>
            ))}
          </select>
        </label>
        <label className="label">
          Person
          <select name="user" defaultValue={userId} className="input">
            <option value="">Anyone</option>
            {people.map((person) => (
              <option key={person.user_id} value={person.user_id}>
                {person.full_name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-quiet">
          Filter
        </button>
      </form>

      {logs.length === 0 ? (
        <p className="panel text-base text-ink-soft">No record matches.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Person</th>
                <th>Action</th>
                <th>Record</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.log_id}>
                  <td className="number whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                  <td>{log.actor?.full_name ?? "Database (no login)"}</td>
                  <td className="font-semibold">{actionLabel(log.action)}</td>
                  <td className="number whitespace-nowrap">
                    {log.table_name} {log.record_id.length > 12 ? `${log.record_id.slice(0, 8)}...` : log.record_id}
                  </td>
                  <td>
                    <details>
                      <summary className="cursor-pointer font-semibold text-brand">Old and new values</summary>
                      <ChangeList title="Before" values={log.details?.old} />
                      <ChangeList title="After" values={log.details?.new} />
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <nav aria-label="Pages" className="number mt-4 flex items-center justify-between gap-3 text-base">
        <p className="text-ink-soft">
          {total} {total === 1 ? "record" : "records"}, page {page} of {pages}
        </p>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={pageLink(page - 1)} className="btn btn-quiet btn-small">
              Newer
            </Link>
          )}
          {page < pages && (
            <Link href={pageLink(page + 1)} className="btn btn-quiet btn-small">
              Older
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}

function ChangeList({ title, values }: { title: string; values?: Record<string, unknown> }) {
  if (!values || Object.keys(values).length === 0) return null;
  return (
    <div className="mt-2">
      <p className="text-xs font-semibold text-ink-soft uppercase">{title}</p>
      <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
        {Object.entries(values).map(([key, value]) => (
          <div key={key} className="contents">
            <dt className="text-ink-soft">{key}</dt>
            <dd className="break-all">{value === null ? "(empty)" : String(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
