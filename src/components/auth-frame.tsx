import Link from "next/link";
import Icon from "./icon";
import Logo from "./logo";

// The frame around the login, sign-up, and password screens. On a computer the
// left half is an evergreen panel that reminds the visitor what ReserBa does,
// and the form sits on the right. On a phone only the form is shown, so
// nothing pushes it down the screen.

const reminders = [
  "See the free hours of every amenity",
  "Know the fee before you send a request",
  "Show one reference number at the gate",
];

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
    <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand p-12 text-on-brand lg:flex xl:p-16">
        <Link href="/" className="self-start rounded-lg focus-visible:outline-on-brand" aria-label="ReserBa, home">
          <Logo onDark />
        </Link>

        {/* The gate of the logo, very large and very faint, as the only ornament. */}
        <svg
          viewBox="5 4 22 24"
          className="pointer-events-none absolute -right-24 -bottom-16 h-[34rem] text-on-brand/[0.04]"
          aria-hidden="true"
        >
          <path d="M7.5 25V15a8.5 8.5 0 0 1 7.5-8.44V25z" fill="currentColor" />
          <path d="M17 25V6.56A8.5 8.5 0 0 1 24.5 15v10z" fill="currentColor" />
        </svg>

        <div className="relative">
          <span className="block h-px w-10 bg-brass-soft" aria-hidden="true" />
          <p className="display mt-8 max-w-md text-[2.75rem] xl:text-[3.25rem]">
            The clubhouse, the court, and the pool. <em>Reserved properly.</em>
          </p>
          <ul className="mt-10 flex flex-col gap-3.5 text-on-brand/80">
            {reminders.map((line) => (
              <li key={line} className="flex items-center gap-3">
                <Icon name="check" className="size-4 text-brass-soft" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-on-brand/55">Amenity booking for homeowners associations</p>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between px-4 pt-5 sm:px-8 lg:justify-end lg:pt-8">
          <Link href="/" className="rounded-lg lg:hidden" aria-label="ReserBa, home">
            <Logo />
          </Link>
          <Link
            href="/"
            className="group inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors duration-150 hover:text-ink"
          >
            <Icon
              name="arrow-left"
              className="size-4 transition-transform duration-200 ease-settle group-hover:-translate-x-0.5"
            />
            Back to the first page
          </Link>
        </header>

        <main className="mx-auto flex w-full max-w-[27rem] flex-1 flex-col gap-6 px-4 pt-10 pb-12 sm:px-0 sm:pt-16 lg:justify-center lg:py-10">
          <div>
            <h1 className="display text-[2.25rem] sm:text-[2.5rem]">{title}</h1>
            {description && <p className="mt-2 text-[0.9375rem] text-ink-soft">{description}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
