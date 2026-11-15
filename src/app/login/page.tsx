import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ActionForm from "@/components/action-form";
import AuthFrame from "@/components/auth-frame";
import PasswordInput from "@/components/password-input";
import { logIn } from "../auth-actions";

export const metadata: Metadata = {
  title: "Log in | ReserBa",
};

// Shown when an email link could not log the person in by itself.
async function LinkNotice({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const { notice } = await searchParams;
  if (notice !== "link") return null;
  return (
    <p className="notice notice-info">
      If you were confirming your email, it is done and you can log in now. If you were setting a new
      password, ask for a new link and open it in this same browser.
    </p>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthFrame title="Log in" description="For residents, HOA administrators, and guards.">
      <Suspense>
        <LinkNotice searchParams={searchParams} />
      </Suspense>
      <ActionForm action={logIn} submitLabel="Log in" pendingLabel="Logging in...">
        <label className="label">
          Email
          <input name="email" type="email" required autoComplete="email" className="input" />
        </label>
        <label className="label">
          Password
          <PasswordInput name="password" required autoComplete="current-password" />
        </label>
      </ActionForm>
      <p className="text-base text-ink-soft">
        <Link href="/forgot-password" className="link">
          Forgot your password?
        </Link>
      </p>
      <p className="text-base text-ink-soft">
        New resident?{" "}
        <Link href="/signup" className="link">
          Create an account
        </Link>
      </p>
    </AuthFrame>
  );
}
