"use client";

import { useActionState, useRef } from "react";
import type { FormState } from "@/lib/types";
import Spinner from "./spinner";

// A form that sends its fields to a server action and shows what came back:
// the reason when the save was refused, or a short confirmation.
// The button is disabled while saving so a double tap cannot save twice.
// An action that cannot be undone first asks "are you sure?" in a small box of
// its own, with the same look as the rest of the screens.

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  pendingLabel?: string;
  buttonClass?: string;
  // Asked before sending, for actions that cannot be undone.
  confirmMessage?: string;
  className?: string;
  // Keeps the button from being pressed, for example while the chosen time is not free.
  disabled?: boolean;
  // Something shown beside the button in a bar that stays at the bottom of a
  // phone screen while the form scrolls, such as the total to pay.
  bar?: React.ReactNode;
  barClass?: string;
  children?: React.ReactNode;
};

export default function ActionForm({
  action,
  submitLabel,
  pendingLabel = "Saving...",
  buttonClass = "btn btn-primary",
  confirmMessage,
  className = "flex flex-col gap-4",
  disabled = false,
  bar,
  barClass = "",
  children,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const form = useRef<HTMLFormElement>(null);
  const question = useRef<HTMLDialogElement>(null);
  // True for the one send that follows a "yes" in the box.
  const agreed = useRef(false);
  const danger = buttonClass.includes("btn-danger");
  // "Cancel this request? The time becomes free." is shown as a question in
  // bold and the rest under it.
  const cut = confirmMessage ? confirmMessage.indexOf("? ") : -1;
  const ask = cut > 0 ? confirmMessage?.slice(0, cut + 1) : "Are you sure?";
  const consequence = cut > 0 ? confirmMessage?.slice(cut + 2) : confirmMessage;

  return (
    <form
      ref={form}
      action={formAction}
      className={className}
      onSubmit={(event) => {
        if (!confirmMessage || agreed.current) {
          agreed.current = false;
          return;
        }
        event.preventDefault();
        question.current?.showModal();
      }}
    >
      {children}
      {confirmMessage && (
        <dialog
          ref={question}
          className="confirm"
          aria-label="Please confirm"
          onClick={(event) => {
            if (event.target === question.current) question.current?.close();
          }}
        >
          <p className="text-lg leading-snug font-semibold">{ask}</p>
          <p className="mt-2 text-[0.9375rem] text-ink-soft">{consequence}</p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="btn btn-quiet" onClick={() => question.current?.close()}>
              Go back
            </button>
            <button
              type="button"
              className={`btn ${danger ? "btn-danger-solid" : "btn-primary"}`}
              onClick={() => {
                question.current?.close();
                agreed.current = true;
                form.current?.requestSubmit();
              }}
            >
              {submitLabel}
            </button>
          </div>
        </dialog>
      )}
      {state.error && (
        <p role="alert" className="notice notice-error">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="notice notice-ok">
          {state.ok}
        </p>
      )}
      {bar ? (
        <div className={barClass}>
          {bar}
          <button type="submit" disabled={pending || disabled} className={buttonClass}>
            {pending && <Spinner />}
            {pending ? pendingLabel : submitLabel}
          </button>
        </div>
      ) : (
        <button type="submit" disabled={pending || disabled} className={buttonClass}>
          {pending && <Spinner />}
            {pending ? pendingLabel : submitLabel}
        </button>
      )}
    </form>
  );
}
