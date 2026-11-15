import Link from "next/link";
import Icon from "./icon";
import Logo from "./logo";

// The frame around the login, sign-up, and password screens. One calm card on
// the page background. On a computer a short list beside it reminds the
// visitor what ReserBa does; on a phone only the form is shown, so nothing
// pushes it down the screen.

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
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 pt-6 sm:px-6">
        <Link href="/" className="rounded-lg" aria-label="ReserBa, home">
          <Logo />
        </Link>
        <Link href="/" className="text-sm font-medium text-ink-soft hover:text-ink">
          Back to the first page
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-20">
        <div className="hidden lg:block">
          <p className="max-w-md text-[2.25rem] leading-[1.1] font-semibold tracking-tight">
            Book the clubhouse, court, or pool without the back-and-forth.
          </p>
          <ul className="mt-8 flex flex-col gap-3 text-ink-soft">
            {reminders.map((line) => (
              <li key={line} className="flex items-center gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-brand-tint text-brand">
                  <Icon name="check" className="size-3.5" />
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-2xl border border-line bg-surface p-6 shadow-high sm:p-8 lg:max-w-none">
          <div>
            <h1 className="text-[1.75rem] font-semibold">{title}</h1>
            {description && <p className="mt-1.5 text-[0.9375rem] text-ink-soft">{description}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
