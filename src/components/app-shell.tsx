import Link from "next/link";
import AccountMenu from "./account-menu";
import Icon from "./icon";
import Logo from "./logo";
import MobileTabs from "./mobile-tabs";
import { SideLinks, type NavItem } from "./nav-links";

// What every signed-in screen sits in. On a computer: a side bar with the
// menu, and the page beside it. On a phone: a slim top bar with the account
// button, and a bottom tab bar, which is where thumbs are. The layout file
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

// A person's initials in a circle, for lists of people.
export function Avatar({ name, className = "size-9" }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-tint text-[0.8125rem] font-semibold text-brand ${className}`}
    >
      {initials(name)}
    </span>
  );
}

export default function AppShell({ fullName, roleName, items, logOut, children }: Props) {
  const letters = initials(fullName);

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <a
        href="#content"
        className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to the page
      </a>

      {/* The top bar of a phone. */}
      <header className="no-print sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-ground/90 pr-3 pl-4 backdrop-blur-md lg:hidden">
        <Link href="/home" className="rounded-lg" aria-label="ReserBa, home">
          <Logo />
        </Link>
        <AccountMenu fullName={fullName} roleName={roleName} initials={letters} logOut={logOut} />
      </header>

      {/* The side bar of a computer. */}
      <aside className="no-print sticky top-0 hidden h-dvh w-[17rem] shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="px-6 pt-7 pb-8">
          <Link href="/home" className="rounded-lg" aria-label="ReserBa, home">
            <Logo />
          </Link>
        </div>

        <nav aria-label="Main menu" className="flex-1 overflow-y-auto px-3 pb-4">
          <SideLinks items={items} />
        </nav>

        <div className="border-t border-line p-3">
          <Link
            href="/account"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-ground"
          >
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-[0.8125rem] font-semibold text-on-brand"
            >
              {letters}
            </span>
            <span className="min-w-0 text-sm leading-tight">
              <span className="block truncate font-semibold" title={fullName}>
                {fullName}
              </span>
              <span className="block truncate text-ink-soft">{roleName}</span>
            </span>
          </Link>
          <form action={logOut}>
            <button
              type="submit"
              className="flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-[0.9375rem] font-medium text-ink-soft transition-colors duration-150 hover:bg-ground hover:text-ink"
            >
              <Icon name="logout" className="size-[1.125rem]" />
              Log out
            </button>
          </form>
        </div>
      </aside>

      <main
        id="content"
        className="mx-auto w-full max-w-[68rem] flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-12 lg:pt-12 lg:pb-16"
      >
        {children}
      </main>

      <MobileTabs items={items} />
    </div>
  );
}

// Shown for the short moment before a screen has its data.
export function ShellLoading() {
  return (
    <div className="flex flex-1 flex-col lg:flex-row" aria-busy="true">
      <div className="h-14 border-b border-line bg-ground lg:h-dvh lg:w-[17rem] lg:shrink-0 lg:border-r lg:border-b-0 lg:bg-surface" />
      <div className="mx-auto w-full max-w-[68rem] flex-1 px-4 py-6 sm:px-6 lg:px-12 lg:py-12">
        <p className="sr-only" role="status">
          Loading
        </p>
        <div className="skeleton h-9 w-56" />
        <div className="skeleton mt-3 h-5 w-80 max-w-full" />
        <div className="skeleton mt-8 h-32 w-full" />
        <div className="skeleton mt-4 h-32 w-full" />
      </div>
    </div>
  );
}
