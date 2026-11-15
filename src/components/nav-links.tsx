"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./icons";

// The menu: groups of links down the side, each with an icon. The current page
// is marked. On a phone the same list sits in the drawer (see mobile-menu.tsx).

export type NavItem = { href: string; label: string; icon: IconName };
export type NavGroup = { label?: string; items: NavItem[] };

export default function NavLinks({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  // The longest matching link wins, so /admin/requests marks "Requests" and
  // not also "Dashboard" (/admin).
  const current = groups
    .flatMap((group) => group.items)
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group, index) => (
        <div key={group.label ?? index}>
          {group.label && (
            <p className="mb-1.5 px-3 text-[0.6875rem] font-medium tracking-[0.1em] text-ink-soft uppercase">
              {group.label}
            </p>
          )}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = current?.href === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex min-h-10 items-center gap-3 rounded-lg px-3 text-[0.9375rem] font-medium transition-colors duration-150 ${
                      active ? "bg-brand-tint text-brand-strong" : "text-ink-soft hover:bg-brand-tint/60 hover:text-ink"
                    }`}
                  >
                    {active && <span className="absolute top-2 bottom-2 -left-px w-0.5 rounded-full bg-brand" />}
                    <Icon
                      name={item.icon}
                      className={`size-[1.125rem] shrink-0 ${active ? "text-brand" : "text-ink-soft group-hover:text-ink"}`}
                    />
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
