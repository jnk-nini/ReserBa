import Link from "next/link";
import { Suspense } from "react";
import AppShell, { ShellLoading } from "@/components/app-shell";
import type { NavItem } from "@/components/nav-links";
import { requireUser } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { logOut } from "../auth-actions";

// The frame around every signed-in screen: the menu of the person's role,
// and the page itself. How it looks is in components/app-shell.tsx.

// `tab` marks the links that sit in the bottom bar on a phone; the rest go
// under "More". The account is not in these lists: on a computer it is at the
// foot of the side bar, on a phone behind the round button in the top bar.
const menus: Record<Role, NavItem[]> = {
  resident: [
    { href: "/home", label: "Home", icon: "home", tab: true },
    { href: "/calendar", label: "Calendar", icon: "calendar", tab: true },
    { href: "/book", label: "Book", icon: "plus", tab: true },
    { href: "/reservations", label: "My reservations", short: "Reservations", icon: "ticket", tab: true },
    { href: "/fund", label: "Fund summary", short: "Fund", icon: "coins", tab: true },
  ],
  // On a computer the links are grouped under small headings.
  admin: [
    { href: "/admin", label: "Dashboard", icon: "gauge", group: "Today", tab: true },
    { href: "/admin/requests", label: "Requests", icon: "inbox", group: "Today", tab: true },
    { href: "/admin/walk-in", label: "Walk-in", icon: "walk", group: "Today" },
    { href: "/calendar", label: "Calendar", icon: "calendar", group: "Today", tab: true },
    { href: "/admin/residents", label: "People", icon: "people", group: "Manage", tab: true },
    { href: "/admin/amenities", label: "Amenities", icon: "building", group: "Manage" },
    { href: "/admin/equipment", label: "Equipment", icon: "box", group: "Manage" },
    { href: "/admin/ledger", label: "Fund ledger", icon: "book", group: "Records" },
    { href: "/admin/reports", label: "Reports", icon: "chart", group: "Records" },
    { href: "/admin/audit", label: "Audit log", icon: "history", group: "Records" },
  ],
  guard: [{ href: "/guard", label: "Today at the gate", short: "Today", icon: "shield", tab: true }],
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
    <AppShell
      fullName={user.full_name}
      roleName={roleNames[user.role]}
      items={menus[user.role]}
      logOut={logOut}
    >
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
    </AppShell>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<ShellLoading />}>
      <Frame>{children}</Frame>
    </Suspense>
  );
}
