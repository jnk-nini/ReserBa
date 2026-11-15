import type { Metadata } from "next";
import Link from "next/link";
import AuthFrame from "@/components/auth-frame";
import SignUpForm from "./sign-up-form";

export const metadata: Metadata = {
  title: "Sign up | ReserBa",
};

// The sign-up page at /signup. It only holds the heading; the form itself
// lives in sign-up-form.tsx because it needs to run in the browser.
export default function SignUpPage() {
  return (
    <AuthFrame
      title="Create your account"
      description="For residents of the subdivision. The HOA administrator will check your address before you can book an amenity."
    >
      <SignUpForm />
      <p className="text-base text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand underline underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthFrame>
  );
}
