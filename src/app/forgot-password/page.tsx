import type { Metadata } from "next";
import Link from "next/link";
import ActionForm from "@/components/action-form";
import AuthFrame from "@/components/auth-frame";
import { requestPasswordReset } from "../auth-actions";

export const metadata: Metadata = {
  title: "Forgot password | ReserBa",
};

export default function ForgotPasswordPage() {
  return (
    <AuthFrame
      title="Forgot your password?"
      description="Type your email and we will send a link to set a new one."
    >
      <ActionForm action={requestPasswordReset} submitLabel="Send the link" pendingLabel="Sending...">
        <label className="label">
          Email
          <input name="email" type="email" required autoComplete="email" className="input" />
        </label>
      </ActionForm>
      <p className="text-base text-ink-soft">
        <Link href="/login" className="link">
          Back to log in
        </Link>
      </p>
    </AuthFrame>
  );
}
