"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./icon";

// The round button with the person's initials in the top bar of a phone. A tap
// opens a sheet with who is signed in, the link to their account, and the log
// out button, so both are always one tap away on every screen.

export default function AccountMenu({
  fullName,
  roleName,
  initials,
  logOut,
}: {
  fullName: string;
  roleName: string;
  initials: string;
  logOut: () => Promise<void>;
}) {
  const sheet = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Moving to another page closes the sheet.
  useEffect(() => {
    sheet.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`Account menu for ${fullName}`}
        onClick={() => sheet.current?.showModal()}
        className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-brand text-[0.8125rem] font-semibold text-on-brand transition-transform duration-150 active:scale-95"
      >
        {initials}
      </button>

      <dialog
        ref={sheet}
        aria-label="Account menu"
        onClick={(event) => {
          // A tap on the dark area around the sheet closes it.
          if (event.target === sheet.current) sheet.current?.close();
        }}
        className="sheet no-print"
      >
        <div className="pb-safe px-4 pt-3 pb-4">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line-strong" aria-hidden="true" />
          <div className="flex items-center gap-3 px-2 pb-4">
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-on-brand"
            >
              {initials}
            </span>
            <p className="min-w-0 leading-tight">
              <span className="block truncate text-base font-semibold">{fullName}</span>
              <span className="text-sm text-ink-soft">{roleName}</span>
            </p>
          </div>
          <div className="border-t border-line pt-2">
            <Link href="/account" className="sheet-row">
              <Icon name="user" />
              Account details
              <Icon name="chevron-right" className="ml-auto size-4 text-ink-soft/60" />
            </Link>
            <form action={logOut}>
              <button type="submit" className="sheet-row w-full cursor-pointer text-refused">
                <Icon name="logout" />
                Log out
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
