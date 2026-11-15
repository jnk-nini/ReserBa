import Link from "next/link";
import Icon from "@/components/icons";
import Logo from "@/components/logo";
import MobileAction from "@/components/mobile-action";
import MobileMenu from "@/components/mobile-menu";
import NavLinks, { type NavGroup } from "@/components/nav-links";
import { logOut } from "@/app/auth-actions";

// The frame of every signed-in screen: the menu down the side on a computer, a
// top bar with a drawer on a phone, and the page itself in the middle.

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function UserCard({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-tint text-sm font-semibold text-brand-strong"
      >
        {initials(name)}
      </span>
      <p className="min-w-0 flex-1 text-sm leading-tight">
        <span className="block truncate font-medium">{name}</span>
        <span className="text-[0.8125rem] text-ink-soft">{role}</span>
      </p>
      <form action={logOut}>
        <button
          type="submit"
          aria-label="Log out"
          title="Log out"
          className="grid size-10 cursor-pointer place-items-center rounded-lg text-ink-soft transition-colors duration-150 hover:bg-brand-tint hover:text-ink"
        >
          <Icon name="logout" className="size-[1.125rem]" />
        </button>
      </form>
    </div>
  );
}

export default function AppShell({
  groups,
  name,
  roleName,
  banner,
  action,
  children,
}: {
  groups: NavGroup[];
  name: string;
  roleName: string;
  banner?: React.ReactNode;
  action: { href: string; label: string } | null;
  children: React.ReactNode;
}) {
  const card = <UserCard name={name} role={roleName} />;

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      {/* A computer: the side bar. */}
      <aside className="no-print hidden border-r border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
        <Link href="/home" className="flex h-16 items-center px-5" aria-label="ReserBa home">
          <Logo />
        </Link>
        <nav aria-label="Main menu" className="flex-1 overflow-y-auto px-3 pt-2 pb-4">
          <NavLinks groups={groups} />
        </nav>
        <div className="border-t border-line p-4">{card}</div>
      </aside>

      {/* A phone: the top bar with the menu button. */}
      <header className="no-print sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur-md lg:hidden">
        <MobileMenu groups={groups} footer={card} />
        <Link href="/home" aria-label="ReserBa home">
          <Logo />
        </Link>
        <span className="size-11" aria-hidden="true" />
      </header>

      <main
        className={`mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10 ${action ? "pb-28 lg:pb-10" : ""}`}
      >
        {banner}
        {children}
      </main>
      {action && <MobileAction href={action.href} label={action.label} />}
    </div>
  );
}
