import Link from "next/link";
import { Suspense } from "react";
import NavLinks, { type NavItem } from "@/components/nav-links";
import { requireUser } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { logOut } from "../auth-actions";

// The frame around every signed-in screen: the green bar with the menu of the
// person's role, and the page itself.

const menus: Record<Role, NavItem[]> = {
  resident: [
    { href: "/calendar", label: "Calendar" },
    { href: "/book", label: "Book" },
    { href: "/reservations", label: "My reservations" },
    { href: "/fund", label: "Fund summary" },
    { href: "/account", label: "Account" },
  ],
  admin: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/requests", label: "Requests" },
    { href: "/admin/walk-in", label: "Walk-in" },
    { href: "/calendar", label: "Calendar" },
    { href: "/admin/residents", label: "People" },
    { href: "/admin/amenities", label: "Amenities" },
    { href: "/admin/equipment", label: "Equipment" },
    { href: "/admin/ledger", label: "Fund ledger" },
    { href: "/admin/reports", label: "Reports" },
    { href: "/admin/audit", label: "Audit log" },
    { href: "/account", label: "Account" },
  ],
  guard: [
    { href: "/guard", label: "Today" },
    { href: "/account", label: "Account" },
  ],
};

const roleNames: Record<Role, string> = {
  resident: "Resident",
  admin: "HOA administrator",
  guard: "Guard",
};

async function Frame({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const waiting = user.role === "resident" && user.residency_status !== "verified";

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="no-print sticky top-0 z-20 bg-brand text-on-brand lg:h-screen lg:w-60 lg:shrink-0 lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 px-4 pt-3 lg:flex-col lg:items-start lg:pt-5">
          <Link href="/home" className="text-xl font-bold tracking-tight">
            ReserBa
          </Link>
          <div className="flex items-center gap-3 lg:w-full lg:flex-col lg:items-start lg:gap-2">
            <p className="text-right text-sm leading-tight lg:text-left">
              <span className="block max-w-40 truncate font-semibold">{user.full_name}</span>
              <span className="text-on-brand/80">{roleNames[user.role]}</span>
            </p>
            <form action={logOut}>
              <button
                type="submit"
                className="cursor-pointer rounded-lg border border-on-brand/50 px-3 py-1.5 text-sm font-semibold transition-colors duration-150 hover:bg-on-brand/15"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
        <nav aria-label="Main menu">
          <NavLinks items={menus[user.role]} />
        </nav>
      </aside>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
        {waiting && (
          <p className="notice notice-info no-print mb-6">
            {user.residency_status === "rejected"
              ? "Your residency was not verified. "
              : "Your account is waiting for the HOA administrator to verify your residency. You can look at the calendar, but you cannot book yet. "}
            <Link href="/account" className="font-semibold underline underline-offset-4">
              {user.residency_status === "rejected"
                ? "See the reason and upload a new proof."
                : user.proof_of_residency_url
                  ? "See your account."
                  : "Upload your proof of residency."}
            </Link>
          </p>
        )}
        {children}
      </main>
    </div>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<p className="p-6 text-base text-ink-soft">Loading...</p>}>
      <Frame>{children}</Frame>
    </Suspense>
  );
}
