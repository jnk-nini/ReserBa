import Link from "next/link";
import Logo from "@/components/logo";

// Shown when someone opens an address that does not exist, for example from
// an old link or a typing mistake.
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10">
      <Link href="/" className="self-start rounded-lg" aria-label="ReserBa, home">
        <Logo />
      </Link>
      <div>
        <p className="eyebrow">Error 404</p>
        <h1 className="display mt-3 text-5xl">This page is not here.</h1>
        <p className="mt-2 text-base text-ink-soft">
          The link may be old, or the address may have a typing mistake. Your reservations are safe.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/home" className="btn btn-primary">
          Go to my screen
        </Link>
        <Link href="/" className="btn btn-quiet">
          Back to the first page
        </Link>
      </div>
    </main>
  );
}
