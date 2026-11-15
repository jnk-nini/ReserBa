"use client";

import { useRef } from "react";
import Icon from "./icons";

// A button that opens a panel. On a phone the panel slides up from the bottom
// of the screen, where the thumb is; on a wider screen it opens in the middle.
// It closes with the X, the Esc key, or a tap outside it.

export default function Sheet({
  title,
  triggerLabel,
  triggerClass = "btn btn-primary",
  children,
}: {
  title: string;
  triggerLabel: React.ReactNode;
  triggerClass?: string;
  children: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className={triggerClass} onClick={() => dialog.current?.showModal()}>
        {triggerLabel}
      </button>
      <dialog
        ref={dialog}
        aria-label={title}
        className="sheet"
        onClick={(event) => {
          // A tap on the dark area around the panel lands on the dialog itself.
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        <div aria-hidden="true" className="mx-auto mb-3 h-1 w-9 rounded-full bg-line-strong sm:hidden" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            className="grid size-10 cursor-pointer place-items-center rounded-lg text-ink-soft transition-colors duration-150 hover:bg-brand-tint"
            onClick={() => dialog.current?.close()}
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </dialog>
    </>
  );
}
