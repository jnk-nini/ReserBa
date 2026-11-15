"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The menu. On a phone it is a row that scrolls sideways under the top bar;
// on a computer it is a list down the left side. The current page is marked.

export type NavItem = { href: string; label: string };

export default function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  // The longest matching link wins, so /admin/requests marks "Requests" and
  // not also "Dashboard" (/admin).
  const current = items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <ul className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-col lg:overflow-visible lg:px-3 lg:py-4">
      {items.map((item) => {
        const active = current?.href === item.href;
        return (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`block rounded-lg px-3 py-2 text-base font-semibold whitespace-nowrap transition-colors duration-150 ${
                active ? "bg-on-brand text-brand" : "text-on-brand/90 hover:bg-on-brand/15"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
