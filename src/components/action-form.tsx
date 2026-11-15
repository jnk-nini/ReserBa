"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/lib/types";
import Icon from "./icons";
import { toast } from "./toaster";

// A form that sends its fields to a server action and shows what came back:
// the reason when the save was refused (on the form), or a short confirmation
// (as a toast). The button is disabled while saving so a double tap cannot
// save twice. Actions that cannot be undone ask first, in a dialog of the app
// instead of the browser's own box.

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  pendingLabel?: string;
  buttonClass?: string;
  // Asked before sending, for actions that cannot be undone.
  confirmMessage?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function ActionForm({
  action,
  submitLabel,
  pendingLabel = "Saving...",
  buttonClass = "btn btn-primary",
  confirmMessage,
  className = "flex flex-col gap-4",
  children,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const form = useRef<HTMLFormElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const confirmed = useRef(false);

  // A saved action says so in a toast, so the message survives even when the
  // form it came from is replaced by the refreshed page.
  useEffect(() => {
    if (state.ok) toast(state.ok);
  }, [state]);

  const destructive = buttonClass.includes("btn-danger");

  return (
    <>
      <form
        ref={form}
        action={formAction}
        className={className}
        onSubmit={(event) => {
          if (confirmMessage && !confirmed.current) {
            event.preventDefault();
            dialog.current?.showModal();
          }
          confirmed.current = false;
        }}
      >
        {children}
        {state.error && (
          <p role="alert" className="notice notice-error flex items-start gap-2">
            <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
            <span>{state.error}</span>
          </p>
        )}
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? pendingLabel : submitLabel}
        </button>
      </form>

      {confirmMessage && (
        <dialog
          ref={dialog}
          aria-label="Please confirm"
          className="sheet"
          onClick={(event) => {
            if (event.target === dialog.current) dialog.current?.close();
          }}
        >
          <div className="flex items-start gap-3">
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-full ${destructive ? "bg-refused-tint text-refused" : "bg-pending-tint text-pending"}`}
            >
              <Icon name="alert" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Are you sure?</h2>
              <p className="mt-1 text-[0.9375rem] text-ink-soft">{confirmMessage}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="btn btn-quiet" onClick={() => dialog.current?.close()}>
              Go back
            </button>
            <button
              type="button"
              className={`btn ${destructive ? "btn-danger-solid" : "btn-primary"}`}
              onClick={() => {
                dialog.current?.close();
                confirmed.current = true;
                form.current?.requestSubmit();
              }}
            >
              Yes, continue
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
