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
    <ul className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:px-4 lg:py-5">
      {items.map((item) => {
        const active = current?.href === item.href;
        return (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-full border px-4 text-base font-semibold whitespace-nowrap transition-colors duration-150 ${
                active
                  ? "border-white/20 bg-white/15 text-white backdrop-blur-md"
                  : "border-transparent text-mint/80 hover:bg-white/10 hover:text-white"
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
