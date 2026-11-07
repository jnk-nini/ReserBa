import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-semibold">ReserBa</h1>
      <p className="text-base text-zinc-600">
        Community amenity booking and schedule conflict detection for
        subdivision homeowners associations.
      </p>
      <Link
        href="/signup"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-base font-medium text-white"
      >
        Sign up
      </Link>
      <Link href="/check" className="text-sm text-zinc-500 underline">
        Connection check
      </Link>
    </main>
  );
}
