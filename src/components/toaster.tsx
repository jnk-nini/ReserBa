"use client";

import { useEffect, useState } from "react";
import Icon from "./icons";

// Short messages that appear in a corner and leave by themselves. Any part of
// the app can call `toast("Saved.")`. Errors stay on the form that caused them,
// where the person can still read them while fixing the field.

type Toast = { id: number; text: string; tone: "ok" | "info" };

const listeners = new Set<(toast: Toast) => void>();
let counter = 0;

export function toast(text: string, tone: Toast["tone"] = "ok") {
  const item = { id: ++counter, text, tone };
  listeners.forEach((listener) => listener(item));
}

export default function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (item: Toast) => {
      setItems((current) => [...current, item]);
      window.setTimeout(() => setItems((current) => current.filter((entry) => entry.id !== item.id)), 5000);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="no-print pointer-events-none fixed inset-x-4 bottom-24 z-50 flex flex-col items-center gap-2 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:items-end"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="pointer-events-auto flex max-w-sm animate-toast-in items-start gap-3 rounded-xl border border-line bg-raised py-3 pr-3 pl-4 text-sm text-ink shadow-pop"
        >
          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-approved-tint text-approved">
            <Icon name="check" className="size-3.5" />
          </span>
          <p className="flex-1 leading-snug">{item.text}</p>
          <button
            type="button"
            aria-label="Dismiss"
            className="-m-1 grid size-7 cursor-pointer place-items-center rounded-md text-ink-soft hover:bg-brand-tint"
            onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
          >
            <Icon name="close" className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
