"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import Icon, { type IconName } from "./icon";
import StatusBadge from "./status-badge";

// The part of the first page that shows what each kind of user gets. The
// visitor picks Residents, HOA administrators, or Guards, and sees a small
// drawing of that person's screen. The drawings use sample names and numbers;
// they are pictures, not the working screens.

type Role = {
  id: string;
  icon: IconName;
  name: string;
  summary: string;
  points: string[];
  address: string;
};

const roles: Role[] = [
  {
    id: "resident",
    icon: "user",
    name: "Residents",
    summary: "Book from your phone, at any hour.",
    points: [
      "See the free and taken hours of every amenity",
      "Know the fee and the deposit before you send a request",
      "Upload your proof of payment and follow the status",
      "Keep your reference number and slip for the day",
    ],
    address: "reserba / my reservations",
  },
  {
    id: "admin",
    icon: "gauge",
    name: "HOA administrators",
    summary: "One list of what is waiting for you.",
    points: [
      "Approve or reject requests, with a reason the resident can read",
      "Encode walk-in bookings for residents who come to the office",
      "Set rates, opening hours, buffer time, and blocked dates",
      "Download the monthly report as PDF or Excel",
    ],
    address: "reserba / dashboard",
  },
  {
    id: "guard",
    icon: "shield",
    name: "Guards",
    summary: "A clear answer at the gate.",
    points: [
      "See the approved reservations for today",
      "Type a reference number to confirm a booking",
      "View only. Nothing on the guard screen changes a record",
    ],
    address: "reserba / today at the gate",
  },
];

function ResidentScreen() {
  const rows = [
    ["Clubhouse", "Sat, Nov 21, 1:00 PM to 5:00 PM", "RB-0013", "approved"],
    ["Swimming Pool", "Sun, Nov 29, 9:00 AM to 11:00 AM", "Request 27", "pending"],
    ["Basketball Court", "Fri, Nov 6, 6:00 PM to 8:00 PM", "RB-0009", "cancelled"],
  ];
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-lg font-bold">My reservations</p>
        <span className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-on-brand">Book an amenity</span>
      </div>
      <ul className="mt-4 flex flex-col divide-y divide-line rounded-xl border border-line bg-surface">
        {rows.map(([name, when, reference, status]) => (
          <li key={reference} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="font-semibold">{name}</p>
              <p className="number truncate text-sm text-ink-soft">{when}</p>
              <p className="font-mono text-sm font-semibold">{reference}</p>
            </div>
            <StatusBadge status={status} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function AdminScreen() {
  const tiles = [
    ["4", "requests to decide"],
    ["2", "residents to verify"],
    ["3", "payment proofs to check"],
  ];
  return (
    <div>
      <p className="font-display text-lg font-bold">Waiting for you</p>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {tiles.map(([count, label]) => (
          <li key={label} className="rounded-xl border border-line bg-surface px-3 py-3">
            <p className="number font-display text-3xl leading-none font-bold text-pending">{count}</p>
            <p className="mt-1.5 text-sm leading-snug text-ink-soft">{label}</p>
          </li>
        ))}
      </ul>
      <div className="mt-3 rounded-xl border border-line bg-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">Clubhouse, Sat, Nov 28</p>
            <p className="number text-sm text-ink-soft">2:00 PM to 6:00 PM, Maria Santos</p>
          </div>
          <StatusBadge status="pending" />
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-approved">
          <Icon name="check" className="size-4" />
          No conflict with other bookings
        </p>
        <div className="mt-3 flex gap-2">
          <span className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-on-brand">Approve</span>
          <span className="rounded-lg border border-refused px-3 py-1.5 text-sm font-semibold text-refused">
            Reject
          </span>
        </div>
      </div>
    </div>
  );
}

function GuardScreen() {
  return (
    <div>
      <p className="font-display text-lg font-bold">Check a reference number</p>
      <div className="mt-3 flex gap-2">
        <span className="flex min-h-11 grow items-center rounded-lg border border-brand bg-surface px-3 font-mono text-lg font-semibold tracking-wide ring-3 ring-brand/15">
          RB-0013
        </span>
        <span className="flex items-center rounded-lg bg-brand px-4 font-semibold text-on-brand">Check</span>
      </div>
      <div className="mt-3 rounded-xl border border-approved/30 bg-approved-tint p-4 text-approved">
        <p className="flex items-center gap-2 font-bold">
          <span className="flex size-6 items-center justify-center rounded-full bg-approved text-on-brand">
            <Icon name="check" className="size-3.5" />
          </span>
          Approved for today
        </p>
        <dl className="number mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="opacity-75">Amenity</dt>
          <dd className="font-semibold">Clubhouse</dd>
          <dt className="opacity-75">Time</dt>
          <dd className="font-semibold">1:00 PM to 5:00 PM</dd>
          <dt className="opacity-75">Reserved for</dt>
          <dd className="font-semibold">Maria Santos</dd>
        </dl>
      </div>
    </div>
  );
}

const screens: Record<string, () => React.ReactNode> = {
  resident: ResidentScreen,
  admin: AdminScreen,
  guard: GuardScreen,
};

export default function RoleShowcase() {
  const [current, setCurrent] = useState("resident");
  const role = roles.find((item) => item.id === current) ?? roles[0];
  const Screen = screens[role.id];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Kinds of users"
        className="inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-line bg-surface p-1.5 shadow-low [scrollbar-width:none]"
      >
        {roles.map((item) => {
          const active = item.id === current;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={active}
              aria-controls="role-panel"
              onClick={() => setCurrent(item.id)}
              className={`relative flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2 font-semibold whitespace-nowrap transition-colors duration-200 ${
                active ? "text-on-brand" : "text-ink-soft hover:text-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="role-tab"
                  className="absolute inset-0 rounded-xl bg-brand"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                />
              )}
              <Icon name={item.icon} className="relative size-[1.125rem]" />
              <span className="relative">{item.name}</span>
            </button>
          );
        })}
      </div>

      <div
        id="role-panel"
        role="tabpanel"
        aria-labelledby={`tab-${role.id}`}
        className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={role.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="text-2xl font-bold sm:text-3xl">{role.summary}</h3>
            <ul className="mt-6 flex flex-col gap-3.5 text-lg">
              {role.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
                    <Icon name="check" className="size-3.5" />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        {/* The drawing of the screen, inside a simple browser window. */}
        <div className="relative" aria-hidden="true">
          <div className="absolute inset-0 -z-10 rounded-[2rem] sm:-inset-4 bg-linear-to-br from-brand/25 via-accent/20 to-transparent blur-2xl" />
          <div className="overflow-hidden rounded-2xl border border-line-strong/70 bg-ground shadow-high">
            <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
              <span className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-refused/50" />
                <span className="size-2.5 rounded-full bg-accent" />
                <span className="size-2.5 rounded-full bg-approved/60" />
              </span>
              <span className="grow truncate rounded-md bg-closed-tint px-3 py-1 text-center text-xs text-ink-soft">
                {role.address}
              </span>
            </div>
            <div className="min-h-[21rem] p-4 sm:p-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Screen />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
