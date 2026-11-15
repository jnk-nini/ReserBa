import type { Metadata } from "next";
import ActionForm from "@/components/action-form";
import AuthFrame from "@/components/auth-frame";
import { setNewPassword } from "../auth-actions";

export const metadata: Metadata = {
  title: "New password | ReserBa",
};

// Reached from the link in the reset email. By then the link has logged the
// person in, which is what allows the password to be changed.
export default function ResetPasswordPage() {
  return (
    <AuthFrame title="Set a new password">
      <ActionForm action={setNewPassword} submitLabel="Save the new password">
        <label className="label">
          New password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input"
          />
          <span className="hint">At least 8 characters.</span>
        </label>
        <label className="label">
          Type it again
          <input name="confirm_password" type="password" required autoComplete="new-password" className="input" />
        </label>
      </ActionForm>
    </AuthFrame>
  );
}
