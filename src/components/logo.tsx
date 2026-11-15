// The ReserBa mark: a calendar tile with a check, drawn in one stroke weight
// so it stays clear from favicon size up. `Logo` is the mark with the name.

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0f5c46" />
      <rect width="32" height="32" rx="9" fill="url(#rb-shine)" />
      <path
        d="M9.5 12.5h13M12.5 8.5v3M19.5 8.5v3"
        stroke="#d8efe4"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="8" y="10" width="16" height="14" rx="3.5" stroke="#d8efe4" strokeWidth="1.8" fill="none" />
      <path d="m12.8 18 2.4 2.4 4.2-4.6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <defs>
        <linearGradient id="rb-shine" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className="text-[1.0625rem] font-semibold tracking-tight">ReserBa</span>
    </span>
  );
}
