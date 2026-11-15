// Every small drawing used in the menus and on the first page. They are all
// drawn the same way (24 by 24, line width 1.75, round ends) so they look like
// one family. An icon sits beside its words, so screen readers skip it.

const paths = {
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  ticket: (
    <>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V10a2 2 0 0 0 0 4v1.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 15.5V14a2 2 0 0 0 0-4z" />
      <path d="M14 6v12" strokeDasharray="2 2.5" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="12" cy="7" rx="7" ry="3" />
      <path d="M5 7v5c0 1.66 3.13 3 7 3s7-1.34 7-3V7M5 12v5c0 1.66 3.13 3 7 3s7-1.34 7-3v-5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.75" />
      <path d="M4.5 20c.8-3.5 3.8-5.5 7.5-5.5s6.7 2 7.5 5.5" />
    </>
  ),
  gauge: (
    <>
      <rect x="3.5" y="3.5" width="7" height="9" rx="1.75" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.75" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1.75" />
      <rect x="3.5" y="15.5" width="7" height="5" rx="1.75" />
    </>
  ),
  inbox: (
    <>
      <path d="M3.5 13.5 6 5.5h12l2.5 8v4A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5z" />
      <path d="M3.5 13.5h5l1 2.5h5l1-2.5h5" />
    </>
  ),
  walk: (
    <>
      <circle cx="13" cy="4.5" r="1.75" />
      <path d="m9 21 2-5.5-2.5-2.5 1-5 3.5 1 2 3.5 3 1M10 8 6.5 10.5 6 13.5M12.5 14.5l2.5 2.5 1 4" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8.5" r="3.25" />
      <path d="M2.5 19.5c.6-3 3-4.75 6.5-4.75s5.9 1.75 6.5 4.75" />
      <path d="M15.5 5.5a3.25 3.25 0 0 1 0 6M18 14.9c1.900.6 3.1 2.1 3.5 4.6" />
    </>
  ),
  building: (
    <>
      <path d="M3 20.5h18M5 20.5V10l7-5.5 7 5.5v10.5" />
      <path d="M10 20.5v-6h4v6" />
    </>
  ),
  box: (
    <>
      <path d="M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16z" />
      <path d="M3.5 8 12 12.5 20.5 8M12 12.5v8" />
    </>
  ),
  book: (
    <>
      <path d="M5 4.5h11.5A2.5 2.5 0 0 1 19 7v12.5H7.5A2.5 2.5 0 0 1 5 17z" />
      <path d="M5 17a2.5 2.5 0 0 1 2.5-2.5H19M9 8.5h6" />
    </>
  ),
  chart: <path d="M4 20.5h16M7 17v-5M12 17V6.5M17 17v-8" />,
  history: (
    <>
      <path d="M4 12a8 8 0 1 0 2.6-5.9L4 8.5" />
      <path d="M4 4.5v4h4M12 8v4.5l3 1.75" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 5 6v5.5c0 4.25 2.8 7.5 7 9 4.2-1.5 7-4.75 7-9V6z" />
      <path d="m9 12 2.25 2.25L15.25 10" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8.5h6M9 12.5h6" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4.5H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h7" />
      <path d="M10.5 12H20M16.5 8.5 20 12l-3.5 3.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.75" />
    </>
  ),
  "eye-off": (
    <>
      <path d="M4 4l16 16M9.9 5.8A9 9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a15 15 0 0 1-2.7 3.4M6.3 7.7A15 15 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 3.8-.85" />
      <path d="M9.9 10.2a2.75 2.75 0 0 0 3.9 3.9" />
    </>
  ),
} as const;

export type IconName = keyof typeof paths;

export default function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
