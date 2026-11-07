import type { Metadata } from "next";
import SignUpForm from "./sign-up-form";

export const metadata: Metadata = {
  title: "Sign up | ReserBa",
};

// The sign-up page at /signup. It only holds the heading; the form itself
// lives in sign-up-form.tsx because it needs to run in the browser.
export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-base text-zinc-600">
          For residents of the subdivision. The HOA administrator will check
          your address before you can book an amenity.
        </p>
      </div>
      <SignUpForm />
    </main>
  );
}
