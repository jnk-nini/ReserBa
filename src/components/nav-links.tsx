"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./icon";

// The menu. `group` names the small heading above a run of links on a computer.
// `tab` marks the links that sit in the bottom bar on a phone; the rest go
// under "More". `short` is a shorter name for the narrow tab.

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  group?: string;
  tab?: boolean;
  short?: string;
};

// The longest matching link wins, so /admin/requests marks "Requests" and
// not also "Dashboard" (/admin).
export function useCurrent(items: NavItem[]) {
  const pathname = usePathname();
  return items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

// The side menu of a computer.
export function SideLinks({ items }: { items: NavItem[] }) {
  const current = useCurrent(items);
  const groups: Array<{ name?: string; items: NavItem[] }> = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.name === item.group) last.items.push(item);
    else groups.push({ name: item.group, items: [item] });
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group, index) => (
        <div key={index}>
          {group.name && (
            <p className="mb-1 px-3 text-xs font-semibold tracking-wide text-ink-soft/80 uppercase">{group.name}</p>
          )}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = current?.href === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[0.9375rem] font-medium transition-colors duration-150 ${
                      active ? "bg-brand-tint text-brand" : "text-ink-soft hover:bg-ground hover:text-ink"
                    }`}
                  >
                    <Icon name={item.icon} className="size-[1.125rem]" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

// One tab of the bottom bar of a phone.
export function TabLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium transition-colors duration-150 active:scale-95 ${
        active ? "text-brand" : "text-ink-soft"
      }`}
    >
      <Icon name={item.icon} className="size-6" />
      <span className="max-w-full truncate px-1">{item.short ?? item.label}</span>
    </Link>
  );
}
