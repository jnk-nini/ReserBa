import type { Metadata } from "next";
import ActionForm from "@/components/action-form";
import PageHeader from "@/components/page-header";
import ProofUpload from "@/components/proof-upload";
import StatusBadge from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { proofLink } from "@/lib/links";
import { saveProfile } from "./actions";

export const metadata: Metadata = {
  title: "Account | ReserBa",
};

export default async function AccountPage() {
  const user = await requireUser();
  const isResident = user.role === "resident";

  return (
    <>
      <PageHeader title="Account" description={user.email} />

      <div className="grid gap-6 lg:grid-cols-2">
        {isResident && (
          <section className="panel flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Residency</h2>
              <StatusBadge status={user.residency_status} />
            </div>
            {user.residency_status === "verified" && (
              <p className="text-base">
                Verified as a {user.resident_type}. You can book amenities.
              </p>
            )}
            {user.residency_status === "pending" && (
              <p className="text-base">
                {user.proof_of_residency_url
                  ? "Your proof was received. The HOA administrator will verify it."
                  : "Upload a proof of residency so the HOA administrator can verify you."}
              </p>
            )}
            {user.residency_status === "rejected" && (
              <p className="notice notice-error">
                Not verified. Reason from the administrator: {user.residency_note ?? "none given"}. Upload
                a new proof and your account goes back to the administrator for another look.
              </p>
            )}
            {user.proof_of_residency_url && (
              <a
                href={proofLink("residency-proofs", user.proof_of_residency_url)}
                target="_blank"
                rel="noreferrer"
                className="link"
              >
                Open the proof you uploaded
              </a>
            )}
            {user.residency_status !== "verified" && (
              <ProofUpload userId={user.user_id} hasProof={Boolean(user.proof_of_residency_url)} />
            )}
          </section>
        )}

        <section className="panel">
          <h2 className="mb-4 text-base font-semibold">Your details</h2>
          <ActionForm action={saveProfile} submitLabel="Save details">
            <label className="label">
              Full name
              <input name="full_name" required defaultValue={user.full_name} autoComplete="name" className="input" />
            </label>
            <label className="label">
              Contact number
              <input
                name="contact_no"
                type="tel"
                defaultValue={user.contact_no ?? ""}
                autoComplete="tel"
                className="input"
              />
            </label>
            <label className="label">
              Home address in the subdivision
              <input
                name="address"
                defaultValue={user.address ?? ""}
                autoComplete="street-address"
                className="input"
              />
            </label>
          </ActionForm>
        </section>
      </div>
    </>
  );
}
