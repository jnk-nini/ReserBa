"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The main action of a role, kept at the bottom of a phone screen. It hides on
// the page it leads to, and on a computer, where the same button is in the page.
export default function MobileAction({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  if (pathname.startsWith(href)) return null;

  return (
    <div className="action-bar no-print lg:hidden">
      <Link href={href} className="btn btn-primary w-full">
        {label}
      </Link>
    </div>
  );
}
