"use client";

import { useRef } from "react";
import Icon from "./icons";
import NavLinks, { type NavGroup } from "./nav-links";

// The menu button of the top bar on a phone. It opens the same menu as the
// side bar on a computer, in a drawer that slides in from the left.
export default function MobileMenu({ groups, footer }: { groups: NavGroup[]; footer: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        aria-label="Open the menu"
        className="-ml-2 grid size-11 cursor-pointer place-items-center rounded-lg text-ink hover:bg-brand-tint"
        onClick={() => dialog.current?.showModal()}
      >
        <Icon name="menu" />
      </button>
      <dialog
        ref={dialog}
        aria-label="Menu"
        className="drawer"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="flex min-h-full flex-col p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="px-3 text-sm font-medium text-ink-soft">Menu</span>
            <button
              type="button"
              aria-label="Close the menu"
              className="grid size-11 cursor-pointer place-items-center rounded-lg text-ink-soft hover:bg-brand-tint"
              onClick={() => dialog.current?.close()}
            >
              <Icon name="close" />
            </button>
          </div>
          <NavLinks groups={groups} onNavigate={() => dialog.current?.close()} />
          <div className="mt-auto border-t border-line pt-4">{footer}</div>
        </div>
      </dialog>
    </>
  );
}
