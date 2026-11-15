"use client";

import { useState } from "react";
import Icon from "./icon";

// A password box with a button to show or hide what was typed, so a person
// on a phone can check it before sending. It takes the same settings as a
// normal input (name, autoComplete, minLength ...).

export default function PasswordInput(props: Omit<React.ComponentProps<"input">, "type" | "className">) {
  const [shown, setShown] = useState(false);

  return (
    <span className="relative block">
      <input {...props} type={shown ? "text" : "password"} className="input pr-12" />
      <button
        type="button"
        onClick={() => setShown(!shown)}
        aria-label={shown ? "Hide the password" : "Show the password"}
        aria-pressed={shown}
        className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-lg text-ink-soft transition-colors duration-150 hover:text-ink"
      >
        <Icon name={shown ? "eye-off" : "eye"} />
      </button>
    </span>
  );
}
