"use client";

// A box with a soft glow that follows the pointer. It only records where the
// pointer is; the glow itself is drawn by the "spotlight" style in globals.css.

export default function Spotlight({
  children,
  className = "",
  color,
}: {
  children: React.ReactNode;
  className?: string;
  // The colour of the glow. Leave it out for the default green.
  color?: string;
}) {
  return (
    <div
      className={`spotlight ${className}`}
      style={color ? ({ "--spot-color": color } as React.CSSProperties) : undefined}
      onPointerMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--spot-x", `${event.clientX - box.left}px`);
        event.currentTarget.style.setProperty("--spot-y", `${event.clientY - box.top}px`);
      }}
    >
      {children}
    </div>
  );
}
