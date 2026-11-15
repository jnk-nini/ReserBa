import Link from "next/link";
import Icon from "./icon";
import Logo from "./logo";
import NavLinks, { type NavItem } from "./nav-links";

// What every signed-in screen sits in: the dark green menu (a top bar on a
// phone, a side bar on a computer) and the page beside it. The layout file
// decides who the person is and which menu they get; this file only draws it.

type Props = {
  fullName: string;
  roleName: string;
  items: NavItem[];
  logOut: () => Promise<void>;
  children: React.ReactNode;
};

// "Jenny Joy Latagan" becomes "JL": the first and the last name.
function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function AppShell({ fullName, roleName, items, logOut, children }: Props) {
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <a
        href="#content"
        className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to the page
      </a>

      <aside className="no-print sticky top-0 z-20 bg-deep text-on-deep lg:flex lg:h-dvh lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-5 lg:pt-6 lg:pb-5">
          <Link href="/home" className="rounded-lg focus-visible:outline-accent" aria-label="ReserBa, home">
            <Logo tone="light" />
          </Link>

          {/* On a phone the person and the log out button sit in the top bar. */}
          <div className="flex items-center gap-2 lg:hidden">
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-full bg-deep-raised text-sm font-bold"
            >
              {initials(fullName)}
            </span>
            <form action={logOut}>
              <button
                type="submit"
                aria-label="Log out"
                className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-on-deep-soft transition-colors duration-150 hover:bg-on-deep/8 hover:text-on-deep focus-visible:outline-accent"
              >
                <Icon name="logout" />
              </button>
            </form>
          </div>
        </div>

        <nav aria-label="Main menu" className="lg:flex-1 lg:overflow-y-auto">
          <NavLinks items={items} />
        </nav>

        {/* On a computer they sit at the foot of the side bar, away from the menu. */}
        <div className="hidden border-t border-on-deep/12 p-3 lg:block">
          <div className="flex items-center gap-3 px-2 py-2">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-deep-raised text-sm font-bold"
            >
              {initials(fullName)}
            </span>
            <p className="min-w-0 text-sm leading-tight">
              <span className="block truncate font-semibold" title={fullName}>
                {fullName}
              </span>
              <span className="text-on-deep-soft">{roleName}</span>
            </p>
          </div>
          <form action={logOut}>
            <button
              type="submit"
              className="flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[0.9375rem] font-semibold text-on-deep-soft transition-colors duration-150 hover:bg-on-deep/8 hover:text-on-deep focus-visible:outline-accent"
            >
              <Icon name="logout" className="size-[1.125rem]" />
              Log out
            </button>
          </form>
        </div>
      </aside>

      <main id="content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}

// Shown for the short moment before a screen has its data.
export function ShellLoading() {
  return (
    <div className="flex flex-1 flex-col lg:flex-row" aria-busy="true">
      <div className="h-28 bg-deep lg:h-dvh lg:w-64 lg:shrink-0" />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <p className="sr-only" role="status">
          Loading
        </p>
        <div className="skeleton h-9 w-56" />
        <div className="skeleton mt-3 h-5 w-80 max-w-full" />
        <div className="skeleton mt-8 h-40 w-full" />
        <div className="skeleton mt-4 h-40 w-full" />
      </div>
    </div>
  );
}
