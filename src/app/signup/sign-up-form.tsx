"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

// The sign-up form. It runs in the browser because it reacts to typing and
// clicks. On submit it asks Supabase to create the account and sends the
// resident's details along as "user data". The database sign-up trigger reads
// full_name, contact_no, address and consent from that user data and creates
// the matching row in the users table.

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; message: string }
  | { kind: "done"; needsEmailCheck: boolean };

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-zinc-900 focus:outline-none";

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

    setStatus({ kind: "sending" });
    try {
      const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
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
      // No session means Supabase is waiting for the email to be confirmed.
      setStatus({ kind: "done", needsEmailCheck: !data.session });
    } catch {
      setStatus({
        kind: "error",
        message: "Could not reach the server. Check your internet and try again.",
      });
    }
  }

  if (status.kind === "done") {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-base text-green-900">
        <p className="font-medium">Account created.</p>
        <p className="mt-1">
          {status.needsEmailCheck
            ? "We sent a confirmation link to your email. Open it to finish. After that, the HOA administrator will verify that you live in the subdivision before you can book."
            : "The HOA administrator will verify that you live in the subdivision before you can book."}
        </p>
      </div>
    );
  }

  const sending = status.kind === "sending";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Full name
        <input
          name="full_name"
          type="text"
          required
          autoComplete="name"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
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

      <label className="flex flex-col gap-1 text-sm font-medium">
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

      <label className="flex flex-col gap-1 text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
        <span className="text-xs font-normal text-zinc-500">At least 8 characters.</span>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Confirm password
        <input
          name="confirm_password"
          type="password"
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input name="consent" type="checkbox" required className="mt-1" />
        <span>
          I agree that ReserBa may collect and keep my name, contact details and
          address to manage amenity bookings, as described under the Data
          Privacy Act of 2012 (RA 10173).
        </span>
      </label>

      {status.kind === "error" && (
        <p
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900"
        >
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-base font-medium text-white disabled:opacity-60"
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
