// The small line drawings used across the screens. Each one is drawn on a
// 24 by 24 grid and takes the colour of the text around it.

type IconName =
  | "calendar"
  | "overlap"
  | "buffer"
  | "blocked"
  | "hours"
  | "equipment"
  | "audit"
  | "send"
  | "slip"
  | "check"
  | "arrow"
  | "chevron"
  | "close"
  | "wallet"
  | "shield";

const paths: Record<IconName, React.ReactNode> = {
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  overlap: (
    <>
      <rect x="3" y="4" width="11" height="11" rx="3" />
      <rect x="10" y="9" width="11" height="11" rx="3" />
      <path d="m4.5 19.5 3-3" />
    </>
  ),
  buffer: (
    <>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 9v4l2.5 2M9.5 2.5h5" />
    </>
  ),
  blocked: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4M9.5 13.5l5 4M14.5 13.5l-5 4" />
    </>
  ),
  hours: (
    <>
      <path d="M4 20.5h16M6 20.5V9l6-5 6 5v11.5" />
      <path d="M10 20.5v-5h4v5" />
    </>
  ),
  equipment: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </>
  ),
  audit: (
    <>
      <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5a1.5 1.5 0 0 1 1-1.5z" />
      <path d="M14 3.5V8h4M9 12.5h6M9 16h4" />
    </>
  ),
  send: <path d="M20.5 3.5 10 14M20.5 3.5l-6.5 17-4-6.5-6.5-4z" />,
  slip: (
    <>
      <path d="M4 8.5V6a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 20 6v2.5a3.5 3.5 0 0 0 0 7V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18v-2.5a3.5 3.5 0 0 0 0-7z" />
      <path d="M14.5 8v1.5M14.5 14.5V16M14.5 11.5v1" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  wallet: (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17a1.5 1.5 0 0 1 1.5 1.5V8" />
      <rect x="4" y="8" width="16.5" height="11.5" rx="2.5" />
      <path d="M16 13.75h.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6z" />
      <path d="m9 12 2.2 2.2L15 10.5" />
    </>
  ),
};

export default function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
