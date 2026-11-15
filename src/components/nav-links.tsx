"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./icon";

// The menu. On a phone it is a row that scrolls sideways under the top bar;
// on a computer it is a list down the left side. The current page is marked.

export type NavItem = { href: string; label: string; icon: IconName };

export default function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  // The longest matching link wins, so /admin/requests marks "Requests" and
  // not also "Dashboard" (/admin).
  const current = items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <ul className="flex gap-1 overflow-x-auto px-3 pb-2.5 [scrollbar-width:none] lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-3 lg:pb-0">
      {items.map((item) => {
        const active = current?.href === item.href;
        return (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-[0.9375rem] font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline-accent ${
                active
                  ? "bg-deep-raised text-on-deep"
                  : "text-on-deep-soft hover:bg-on-deep/8 hover:text-on-deep"
              }`}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent lg:inset-x-auto lg:inset-y-2 lg:left-0 lg:h-auto lg:w-0.5"
                />
              )}
              <Icon name={item.icon} className={`size-[1.125rem] ${active ? "text-accent" : ""}`} />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
