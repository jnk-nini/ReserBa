import Link from "next/link";
import Icon from "./icon";
import Logo from "./logo";

// The frame around the login, sign-up, and password screens. On a computer
// the dark green panel on the left reminds the visitor what ReserBa does; on
// a phone only the form is shown, so nothing pushes it down the screen.

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
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="dot-grid hidden bg-deep text-on-deep lg:flex lg:w-[26rem] lg:shrink-0 lg:flex-col lg:justify-between lg:p-10 xl:w-[30rem]">
        <Link href="/" className="self-start rounded-lg focus-visible:outline-accent" aria-label="ReserBa, home">
          <Logo tone="light" />
        </Link>
        <div>
          <p className="font-display text-[2rem] leading-[1.15] font-bold tracking-tight">
            Book the clubhouse, court, or pool without the back-and-forth.
          </p>
          <ul className="mt-8 flex flex-col gap-3 text-on-deep-soft">
            {reminders.map((line) => (
              <li key={line} className="flex items-center gap-2.5">
                <Icon name="check" className="size-4 text-accent" />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-on-deep-soft">
          Your details are used only to manage amenity bookings.
        </p>
      </aside>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10 sm:px-6 lg:max-w-none lg:items-center">
        <div className="flex w-full flex-col gap-6 lg:max-w-md">
          <Link href="/" className="self-start rounded-lg lg:hidden" aria-label="ReserBa, home">
            <Logo />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && <p className="mt-2 text-base text-ink-soft">{description}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
