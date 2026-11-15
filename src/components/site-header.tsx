"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./logo";

// The bar at the top of the first page. It is plain until the visitor scrolls,
// then gets a hairline and a soft white background so the links stay readable.

export default function SiteHeader({ sections }: { sections: Array<{ href: string; label: string }> }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    // Also checks once after loading, in case the page opens already scrolled.
    const first = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 border-b transition-[background-color,border-color] duration-200 ${
        scrolled ? "border-line bg-ground/85 backdrop-blur-xl" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="rounded-lg" aria-label="ReserBa, home">
          <Logo />
        </Link>
        <nav aria-label="Sections of this page" className="hidden lg:block">
          <ul className="flex gap-1">
            {sections.map((section) => (
              <li key={section.href}>
                <a
                  href={section.href}
                  className="rounded-lg px-3 py-2 text-[0.9375rem] font-medium text-ink-soft transition-colors duration-150 hover:text-ink"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn btn-quiet btn-small sm:min-h-10 sm:px-4">
            Log in
          </Link>
          <Link href="/signup" className="btn btn-primary btn-small hidden sm:inline-flex sm:min-h-10 sm:px-4">
            Create account
          </Link>
        </div>
      </div>
    </header>
  );
}
