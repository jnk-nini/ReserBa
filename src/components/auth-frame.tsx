import Link from "next/link";
import Logo from "./logo";

// The frame around the login, sign-up, and password screens: a plain card on
// a quiet ground, beside a short statement of what the product is for.
export default function AuthFrame({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <aside className="emerald on-dark relative hidden flex-col justify-between p-12 lg:flex">
        <Link href="/" aria-label="ReserBa home" className="w-fit text-white">
          <Logo />
        </Link>
        <div>
          <p className="max-w-md font-display text-5xl leading-[1.08] tracking-tight">
            The schedule that <em className="text-sage">protects itself.</em>
          </p>
          <p className="mt-5 max-w-sm text-base text-ink-soft">
            No double bookings, buffer time kept, fees computed, and every approval on record.
          </p>
        </div>
        <p className="text-sm text-ink-soft">Amenity booking for homeowners associations</p>
      </aside>

      <main className="flex flex-col justify-center px-4 py-10 sm:px-8">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
          <Link href="/" aria-label="ReserBa home" className="w-fit lg:hidden">
            <Logo />
          </Link>
          <div>
            <h1 className="font-display text-4xl leading-tight font-normal tracking-tight">{title}</h1>
            {description && <p className="mt-2 text-[0.9375rem] text-ink-soft">{description}</p>}
          </div>
          <div className="flex flex-col gap-5">{children}</div>
        </div>
      </main>
    </div>
  );
}
