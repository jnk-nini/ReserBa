// The small line drawings used across the screens. Each one is drawn on a
// 24 by 24 grid and takes the colour of the text around it.

export type IconName =
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
  | "shield"
  | "home"
  | "plus"
  | "list"
  | "people"
  | "building"
  | "chart"
  | "user"
  | "menu"
  | "logout"
  | "inbox"
  | "walkin"
  | "ledger"
  | "gate"
  | "info"
  | "alert"
  | "download"
  | "sparkle";

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
  home: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="4.5" rx="2" />
      <rect x="13.5" y="11" width="7" height="9.5" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  list: <path d="M8.5 6.5H20M8.5 12H20M8.5 17.5H20M4 6.5h.01M4 12h.01M4 17.5h.01" />,
  people: (
    <>
      <circle cx="9" cy="8.5" r="3.25" />
      <path d="M3 19.5c.4-3.2 2.9-5 6-5s5.6 1.8 6 5" />
      <path d="M16 5.6a3.1 3.1 0 0 1 0 5.8M18 14.9c1.7.6 2.8 2.1 3 4.6" />
    </>
  ),
  building: (
    <>
      <path d="M5 20.5V5.5A1.5 1.5 0 0 1 6.5 4h6A1.5 1.5 0 0 1 14 5.5v15M14 10h3.5A1.5 1.5 0 0 1 19 11.5v9M3.5 20.5h17" />
      <path d="M8.5 8h2M8.5 12h2M8.5 16h2" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16.5h16.5" />
      <path d="M8.5 16v-4M13 16V8M17.5 16v-6.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.75" />
      <path d="M4.5 20c.6-3.6 3.5-5.5 7.5-5.5s6.9 1.9 7.5 5.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  logout: (
    <>
      <path d="M14 4.5h3.5A1.5 1.5 0 0 1 19 6v12a1.5 1.5 0 0 1-1.5 1.5H14" />
      <path d="M10 8.5 5.5 12l4.5 3.5M5.5 12H15" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13.5 6.2 6A1.5 1.5 0 0 1 7.6 5h8.8a1.5 1.5 0 0 1 1.4 1L20 13.5" />
      <path d="M4 13.5V18a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 18v-4.5h-4.5a3.5 3.5 0 0 1-7 0z" />
    </>
  ),
  walkin: (
    <>
      <circle cx="13" cy="5" r="1.75" />
      <path d="m10.5 20 1.5-5.5-2.5-2.5 1-4 3.5 1.5 2.5 2.5M8 12.5 6 15M12 14.5l3 2 .5 3.5" />
    </>
  ),
  ledger: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
      <path d="M8 8.5h8M8 12.5h8M8 16.5h4" />
    </>
  ),
  gate: (
    <>
      <path d="M4 20.5V9l8-5 8 5v11.5M9 20.5v-6h6v6" />
      <path d="M3 20.5h18" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 7.9v.1" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 3 19.5h18z" />
      <path d="M12 10v4.5M12 17.2v.1" />
    </>
  ),
  download: <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />,
  sparkle: <path d="M12 3.5 14 10l6.5 2-6.5 2-2 6.5-2-6.5-6.5-2L10 10z" />,
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
