"use client";

import { useEffect } from "react";

// Gives every button a soft circle that spreads from the press, so a click is
// seen and not only felt. One listener for the whole page: any element with
// the "btn" class gets it, including buttons that are added later.

export default function ClickRipple() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onPress = (event: PointerEvent) => {
      const button = (event.target as Element | null)?.closest<HTMLElement>(".btn");
      if (!button || (button instanceof HTMLButtonElement && button.disabled)) return;

      const box = button.getBoundingClientRect();
      const size = Math.max(box.width, box.height) * 2;
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.setAttribute("aria-hidden", "true");
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - box.left - size / 2}px`;
      ripple.style.top = `${event.clientY - box.top - size / 2}px`;
      ripple.addEventListener("animationend", () => ripple.remove());
      button.appendChild(ripple);
    };

    document.addEventListener("pointerdown", onPress, { passive: true });
    return () => document.removeEventListener("pointerdown", onPress);
  }, []);

  return null;
}
