import type { Metadata } from "next";
import Link from "next/link";
import ActionForm from "@/components/action-form";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { proofLink } from "@/lib/links";
import { getServerSupabase } from "@/lib/supabase-server";
import { formatDate } from "@/lib/time";
import type { UserRow } from "@/lib/types";
import { changeRole, reviewResident } from "./actions";

export const metadata: Metadata = {
  title: "People | ReserBa",
};

const tabs = [
  { key: "pending", label: "To verify" },
  { key: "verified", label: "Verified" },
  { key: "rejected", label: "Rejected" },
  { key: "staff", label: "Administrators and guards" },
];

// Accounts: verify residents (FR-04) and set roles (FR-05).
export default async function ResidentsPage({ searchParams }: PageProps<"/admin/residents">) {
  const me = await requireRole("admin");
  const params = await searchParams;
  const show = tabs.some((tab) => tab.key === params.show) ? String(params.show) : "pending";

  const supabase = await getServerSupabase();
  let query = supabase.from("users").select("*").order("created_at", { ascending: false }).limit(200);
  query =
    show === "staff"
      ? query.in("role", ["admin", "guard"])
      : query.eq("role", "resident").eq("residency_status", show);
  const { data } = await query;
  const people = (data ?? []) as UserRow[];

  return (
    <>
      <PageHeader
        title="People"
        description="Check each new resident's proof of residency. Only verified residents can book."
      />

      <nav aria-label="Filter people" className="mb-4 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/residents?show=${tab.key}`}
            aria-current={show === tab.key ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-base font-semibold whitespace-nowrap transition-colors duration-150 ${
              show === tab.key ? "bg-brand text-on-brand" : "text-ink hover:bg-brand-tint/70"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {people.length === 0 ? (
        <p className="panel text-base text-ink-soft">Nobody here.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {people.map((person) => (
            <li key={person.user_id} className="panel flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold">{person.full_name}</h2>
                  <p className="text-base text-ink-soft">
                    {person.email}
                    {person.contact_no && ` · ${person.contact_no}`}
                  </p>
                  <p className="text-base text-ink-soft">{person.address ?? "No address given"}</p>
                  <p className="text-sm text-ink-soft">Signed up {formatDate(person.created_at)}</p>
                </div>
                {person.role === "resident" ? (
                  <StatusBadge status={person.residency_status} />
                ) : (
                  <span className="badge bg-brand-tint text-brand">
                    {person.role === "admin" ? "Administrator" : "Guard"}
                  </span>
                )}
              </div>

              {person.role === "resident" &&
                (person.proof_of_residency_url ? (
                  <a
                    href={proofLink("residency-proofs", person.proof_of_residency_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="self-start font-semibold text-brand underline underline-offset-4"
                  >
                    Open the proof of residency
                  </a>
                ) : (
                  <p className="text-base text-pending">No proof of residency uploaded yet.</p>
                ))}
              {person.residency_status === "rejected" && (
                <p className="text-base text-ink-soft">Reason given: {person.residency_note}</p>
              )}
              {person.residency_status === "verified" && person.role === "resident" && (
                <p className="text-base text-ink-soft">Verified as a {person.resident_type}.</p>
              )}

              {person.role === "resident" && person.residency_status !== "verified" && (
                <div className="grid gap-4 border-t border-line pt-3 sm:grid-cols-2">
                  <ActionForm action={reviewResident} submitLabel="Verify" buttonClass="btn btn-primary self-start">
                    <input type="hidden" name="user_id" value={person.user_id} />
                    <input type="hidden" name="decision" value="verified" />
                    <label className="label">
                      Resident type
                      <select name="resident_type" required defaultValue="" className="input">
                        <option value="" disabled>
                          Choose
                        </option>
                        <option value="homeowner">Homeowner</option>
                        <option value="tenant">Tenant</option>
                      </select>
                    </label>
                  </ActionForm>
                  {person.residency_status === "pending" && (
                    <ActionForm action={reviewResident} submitLabel="Reject" buttonClass="btn btn-danger self-start">
                      <input type="hidden" name="user_id" value={person.user_id} />
                      <input type="hidden" name="decision" value="rejected" />
                      <label className="label">
                        Reason for rejecting
                        <input name="note" required className="input" placeholder="For example: the photo is blurry" />
                      </label>
                    </ActionForm>
                  )}
                </div>
              )}

              {person.user_id !== me.user_id && (
                <details className="border-t border-line pt-3 text-base">
                  <summary className="cursor-pointer font-semibold">Change role</summary>
                  <ActionForm
                    action={changeRole}
                    submitLabel="Save role"
                    buttonClass="btn btn-quiet btn-small self-start"
                    className="mt-3 flex flex-col gap-3"
                    confirmMessage="Change this account's role? An administrator can see and change every record."
                  >
                    <input type="hidden" name="user_id" value={person.user_id} />
                    <label className="label max-w-xs">
                      Role
                      <select name="role" defaultValue={person.role} className="input">
                        <option value="resident">Resident</option>
                        <option value="guard">Guard</option>
                        <option value="admin">HOA administrator</option>
                      </select>
                    </label>
                  </ActionForm>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
