import Link from "next/link";
import { Suspense } from "react";
import AppShell, { ShellLoading } from "@/components/app-shell";
import type { NavItem } from "@/components/nav-links";
import { requireUser } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { logOut } from "../auth-actions";

// The frame around every signed-in screen: the menu of the person's role,
// and the page itself. How it looks is in components/app-shell.tsx.

const menus: Record<Role, NavItem[]> = {
  resident: [
    { href: "/calendar", label: "Calendar", icon: "calendar" },
    { href: "/book", label: "Book", icon: "plus" },
    { href: "/reservations", label: "My reservations", icon: "ticket" },
    { href: "/fund", label: "Fund summary", icon: "coins" },
    { href: "/account", label: "Account", icon: "user" },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", icon: "gauge" },
    { href: "/admin/requests", label: "Requests", icon: "inbox" },
    { href: "/admin/walk-in", label: "Walk-in", icon: "walk" },
    { href: "/calendar", label: "Calendar", icon: "calendar" },
    { href: "/admin/residents", label: "People", icon: "people" },
    { href: "/admin/amenities", label: "Amenities", icon: "building" },
    { href: "/admin/equipment", label: "Equipment", icon: "box" },
    { href: "/admin/ledger", label: "Fund ledger", icon: "book" },
    { href: "/admin/reports", label: "Reports", icon: "chart" },
    { href: "/admin/audit", label: "Audit log", icon: "history" },
    { href: "/account", label: "Account", icon: "user" },
  ],
  guard: [
    { href: "/guard", label: "Today", icon: "shield" },
    { href: "/account", label: "Account", icon: "user" },
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
