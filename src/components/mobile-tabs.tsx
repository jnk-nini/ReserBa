"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./icon";
import { TabLink, useCurrent, type NavItem } from "./nav-links";

// The bottom bar of a phone. The links marked `tab` sit in the bar; when there
// are more, a "More" tab opens a sheet with the rest and the log out button.

export default function MobileTabs({
  items,
  fullName,
  roleName,
  logOut,
}: {
  items: NavItem[];
  fullName: string;
  roleName: string;
  logOut: () => Promise<void>;
}) {
  const current = useCurrent(items);
  const pathname = usePathname();
  const sheet = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const tabs = items.filter((item) => item.tab);
  const more = items.filter((item) => !item.tab);
  const moreActive = more.some((item) => item.href === current?.href);

  // A tap on a link in the sheet moves to another page: close the sheet.
  useEffect(() => {
    sheet.current?.close();
  }, [pathname]);

  return (
    <>
      <nav
        aria-label="Main menu"
        className="no-print pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/92 backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto flex max-w-lg">
          {tabs.map((item) => (
            <TabLink key={item.href} item={item} active={current?.href === item.href} />
          ))}
          {more.length > 0 && (
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={open}
              onClick={() => sheet.current?.showModal()}
              className={`flex min-h-14 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium transition-colors duration-150 active:scale-95 ${
                moreActive ? "text-brand" : "text-ink-soft"
              }`}
            >
              <Icon name="more" className="size-6" />
              More
            </button>
          )}
        </div>
      </nav>

      <dialog
        ref={sheet}
        onClose={() => setOpen(false)}
        onToggle={(event) => setOpen((event.currentTarget as HTMLDialogElement).open)}
        onClick={(event) => {
          // A tap on the dark area around the sheet closes it.
          if (event.target === sheet.current) sheet.current?.close();
        }}
        className="no-print m-0 mt-auto max-h-[85dvh] w-full max-w-none overflow-y-auto rounded-t-3xl bg-surface p-0 text-ink shadow-high backdrop:bg-ink/40"
      >
        <div className="pb-safe px-4 pt-3 pb-4">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-strong" aria-hidden="true" />
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-sm leading-tight">
              <span className="block font-semibold">{fullName}</span>
              <span className="text-ink-soft">{roleName}</span>
            </p>
            <button
              type="button"
              aria-label="Close the menu"
              onClick={() => sheet.current?.close()}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full text-ink-soft hover:bg-ground"
            >
              <Icon name="close" />
            </button>
          </div>
          <ul className="flex flex-col">
            {more.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current?.href === item.href ? "page" : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-medium ${
                    current?.href === item.href ? "bg-brand-tint text-brand" : "text-ink active:bg-ground"
                  }`}
                >
                  <Icon name={item.icon} />
                  {item.label}
                  <Icon name="chevron-right" className="ml-auto size-4 text-ink-soft/60" />
                </Link>
              </li>
            ))}
          </ul>
          <form action={logOut} className="mt-2 border-t border-line pt-2">
            <button
              type="submit"
              className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-base font-medium text-ink-soft active:bg-ground"
            >
              <Icon name="logout" />
              Log out
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
