"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/types";

// A form that sends its fields to a server action and shows what came back:
// the reason when the save was refused, or a short confirmation.
// The button is disabled while saving so a double tap cannot save twice.

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

  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
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
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
