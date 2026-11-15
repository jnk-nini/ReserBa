"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import PasswordInput from "@/components/password-input";
import { checkProofFile, uploadProof } from "@/lib/upload";

// The sign-up form. It runs in the browser because it reacts to typing and
// clicks. On submit it asks Supabase to create the account and sends the
// resident's details along as "user data". The database sign-up trigger reads
// full_name, contact_no, address and consent from that user data and creates
// the matching row in the users table.
//
// The proof of residency is a file, and only a logged-in person may upload to
// the private bucket. When Supabase logs the new account in right away, the
// file is uploaded here. When Supabase first wants the email confirmed, there
// is no login yet, so the resident uploads the proof from the Account page
// after confirming.

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; message: string }
  | { kind: "done"; needsEmailCheck: boolean; proofSaved: boolean };

const inputClass = "input";

export default function SignUpForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const fullName = String(form.get("full_name") ?? "").trim();
    const contactNo = String(form.get("contact_no") ?? "").trim();
    const address = String(form.get("address") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm_password") ?? "");
    const consent = form.get("consent") === "on";
    const proofEntry = form.get("proof");
    const proof = proofEntry instanceof File && proofEntry.size > 0 ? proofEntry : null;

    // Checks that the browser cannot do alone.
    if (password.length < 8) {
      setStatus({ kind: "error", message: "The password needs at least 8 characters." });
      return;
    }
    if (password !== confirm) {
      setStatus({ kind: "error", message: "The two passwords do not match." });
      return;
    }
    if (!consent) {
      setStatus({
        kind: "error",
        message: "You must agree to the privacy notice to create an account.",
      });
      return;
    }

    if (proof) {
      const problem = checkProofFile(proof);
      if (problem) {
        setStatus({ kind: "error", message: problem });
        return;
      }
    }

    setStatus({ kind: "sending" });
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Where the confirmation link in the email comes back to.
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
          // These keys must match what the database trigger reads.
          data: {
            full_name: fullName,
            contact_no: contactNo,
            address,
            consent: "true",
          },
        },
      });

      if (error) {
        setStatus({ kind: "error", message: friendlyError(error.message) });
        return;
      }
      // Supabase hides whether an email is already registered by returning a
      // user with no identities. Treat that as "already registered".
      if (data.user && data.user.identities?.length === 0) {
        setStatus({
          kind: "error",
          message: "This email is already registered.",
        });
        return;
      }
      // A session means the account is already logged in, so the proof can be
      // uploaded now and its path saved on the resident's own row.
      let proofSaved = false;
      if (data.session && data.user && proof) {
        try {
          const path = await uploadProof("residency-proofs", data.user.id, proof);
          const { error: saveError } = await supabase
            .from("users")
            .update({ proof_of_residency_url: path })
            .eq("user_id", data.user.id);
          proofSaved = !saveError;
        } catch {
          proofSaved = false;
        }
      }
      // No session means Supabase is waiting for the email to be confirmed.
      setStatus({ kind: "done", needsEmailCheck: !data.session, proofSaved });
    } catch {
      setStatus({
        kind: "error",
        message: "Could not reach the server. Check your internet and try again.",
      });
    }
  }

  if (status.kind === "done") {
    return (
      <div className="notice notice-ok">
        <p className="font-semibold">Account created.</p>
        {status.needsEmailCheck ? (
          <p className="mt-1">
            We sent a confirmation link to your email. Open it to finish. Then log in and upload your
            proof of residency on the Account page, so the HOA administrator can verify that you live
            in the subdivision.
          </p>
        ) : status.proofSaved ? (
          <p className="mt-1">
            Your proof of residency was received. The HOA administrator will verify it before you can
            book.
          </p>
        ) : (
          <p className="mt-1">
            One more step: upload your proof of residency on the Account page, so the HOA
            administrator can verify that you live in the subdivision.
          </p>
        )}
        {!status.needsEmailCheck && (
          <Link href="/account" className="btn btn-primary mt-3">
            Go to my account
          </Link>
        )}
      </div>
    );
  }

  const sending = status.kind === "sending";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="label">
        Full name
        <input
          name="full_name"
          type="text"
          required
          autoComplete="name"
          className={inputClass}
        />
      </label>

      <label className="label">
        Contact number
        <input
          name="contact_no"
          type="tel"
          required
          autoComplete="tel"
          placeholder="09XX XXX XXXX"
          className={inputClass}
        />
      </label>

      <label className="label">
        Home address in the subdivision
        <input
          name="address"
          type="text"
          required
          autoComplete="street-address"
          placeholder="Block, lot, street"
          className={inputClass}
        />
      </label>

      <label className="label">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </label>

      <label className="label">
        Password
        <PasswordInput name="password" required minLength={8} autoComplete="new-password" />
        <span className="hint">At least 8 characters.</span>
      </label>

      <label className="label">
        Confirm password
        <PasswordInput name="confirm_password" required autoComplete="new-password" />
      </label>

      <label className="label">
        Proof of residency
        <input
          name="proof"
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-brand-tint file:px-3 file:py-1 file:font-semibold file:text-brand`}
        />
        <span className="hint">
          A photo or PDF of a utility bill, title, or lease that shows your name and address. JPG,
          PNG, or PDF, up to 5 MB. You can also add it later from your Account page.
        </span>
      </label>

      <label className="flex items-start gap-2 text-base">
        <input name="consent" type="checkbox" required className="mt-1 size-5 shrink-0" />
        <span>
          I agree that ReserBa may collect and keep my name, contact details and
          address to manage amenity bookings, as described under the Data
          Privacy Act of 2012 (RA 10173).
        </span>
      </label>

      {status.kind === "error" && (
        <p
          role="alert"
          className="notice notice-error"
        >
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="btn btn-primary"
      >
        {sending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}

// Turns Supabase's technical messages into short sentences a resident can use.
function friendlyError(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("already registered")) {
    return "This email is already registered.";
  }
  if (text.includes("password")) {
    return "That password is not accepted. Try a longer one.";
  }
  if (text.includes("rate limit")) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  if (text.includes("database error")) {
    return "We could not create the account. Check that your name is filled in and the privacy box is ticked.";
  }
  return "We could not create the account. Please try again.";
}
