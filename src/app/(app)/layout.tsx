import Link from "next/link";
import { Suspense } from "react";
import Icon from "@/components/icons";
import AppShell from "@/components/app-shell";
import { type NavGroup } from "@/components/nav-links";
import { requireUser } from "@/lib/auth";
import type { Role } from "@/lib/types";

// The frame around every signed-in screen: the menu of the person's role down
// the side (a drawer on a phone), and the page itself. On a phone the main
// action of the role stays at the bottom of the screen.

const menus: Record<Role, NavGroup[]> = {
  resident: [
    {
      items: [
        { href: "/calendar", label: "Calendar", icon: "calendar" },
        { href: "/book", label: "Book", icon: "plus" },
        { href: "/reservations", label: "My reservations", icon: "slip" },
      ],
    },
    {
      label: "Community",
      items: [{ href: "/fund", label: "Fund summary", icon: "wallet" }],
    },
    { label: "You", items: [{ href: "/account", label: "Account", icon: "user" }] },
  ],
  admin: [
    {
      label: "Today",
      items: [
        { href: "/admin", label: "Dashboard", icon: "home" },
        { href: "/admin/requests", label: "Requests", icon: "inbox" },
        { href: "/admin/walk-in", label: "Walk-in", icon: "walkin" },
        { href: "/calendar", label: "Calendar", icon: "calendar" },
      ],
    },
    {
      label: "Manage",
      items: [
        { href: "/admin/residents", label: "People", icon: "people" },
        { href: "/admin/amenities", label: "Amenities", icon: "building" },
        { href: "/admin/equipment", label: "Equipment", icon: "equipment" },
      ],
    },
    {
      label: "Records",
      items: [
        { href: "/admin/ledger", label: "Fund ledger", icon: "ledger" },
        { href: "/admin/reports", label: "Reports", icon: "chart" },
        { href: "/admin/audit", label: "Audit log", icon: "audit" },
      ],
    },
    { label: "You", items: [{ href: "/account", label: "Account", icon: "user" }] },
  ],
  guard: [
    {
      items: [{ href: "/guard", label: "Today", icon: "gate" }],
    },
    { label: "You", items: [{ href: "/account", label: "Account", icon: "user" }] },
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
  const action =
    user.role === "admin"
      ? { href: "/admin/walk-in", label: "Encode a walk-in" }
      : user.role === "resident" && !waiting
        ? { href: "/book", label: "Book now" }
        : null;

  const banner = waiting ? (
    <p className="notice notice-info no-print mb-6 flex items-start gap-2.5">
      <Icon name="info" className="mt-0.5 size-4 shrink-0" />
      <span>
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
      </span>
    </p>
  ) : null;

  return (
    <AppShell groups={menus[user.role]} name={user.full_name} roleName={roleNames[user.role]} banner={banner} action={action}>
      {children}
    </AppShell>
  );
}

// What shows while the person's account is loaded: the shape of the page, so
// it does not jump when the content arrives.
function FrameSkeleton() {
  return (
    <div className="flex flex-1 flex-col lg:flex-row" aria-busy="true">
      <div className="hidden w-64 shrink-0 border-r border-line bg-surface lg:block" />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="skeleton mb-2 h-8 w-56" />
        <div className="skeleton mb-8 h-4 w-80 max-w-full" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<FrameSkeleton />}>
      <Frame>{children}</Frame>
    </Suspense>
  );
}
