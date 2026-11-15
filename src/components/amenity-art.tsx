// A drawn picture for an amenity, chosen by its name, so a list of amenities
// is something to look at and not only a list of words. Flat shapes in the
// brand greens; no photo is needed. An administrator's own amenity names fall
// back to the clubhouse picture.

type Kind = "court" | "pool" | "hall" | "garden";

function kindOf(name: string): Kind {
  const text = name.toLowerCase();
  if (/(court|basket|tennis|volley|badminton|gym|sport)/.test(text)) return "court";
  if (/(pool|swim|water|splash)/.test(text)) return "pool";
  if (/(garden|park|pavilion|gazebo|picnic|playground)/.test(text)) return "garden";
  return "hall";
}

const scenes: Record<Kind, React.ReactNode> = {
  court: (
    <>
      <rect width="320" height="160" fill="#134e3b" />
      <rect x="28" y="28" width="264" height="104" rx="6" fill="#1b7a5d" />
      <g stroke="#d8efe4" strokeWidth="2.5" fill="none" opacity=".85">
        <rect x="28" y="28" width="264" height="104" rx="6" />
        <path d="M160 28v104" />
        <circle cx="160" cy="80" r="20" />
        <path d="M28 52h34v56H28M292 52h-34v56h34" />
      </g>
      <circle cx="224" cy="62" r="9" fill="#c9973f" />
      <path d="M215.5 62h17M224 53.5v17" stroke="#8a5300" strokeWidth="1.4" />
    </>
  ),
  pool: (
    <>
      <rect width="320" height="160" fill="#0d3a31" />
      <rect x="24" y="24" width="272" height="112" rx="22" fill="#1b9a86" />
      <rect x="24" y="24" width="272" height="112" rx="22" fill="url(#pool-shine)" />
      <g stroke="#d8efe4" strokeWidth="2.5" strokeLinecap="round" opacity=".7" fill="none">
        <path d="M56 62c14-8 28 8 42 0s28 8 42 0 28 8 42 0 28 8 42 0M76 100c14-8 28 8 42 0s28 8 42 0 28 8 42 0" />
      </g>
      <defs>
        <linearGradient id="pool-shine" x1="0" y1="0" x2="320" y2="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity=".28" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </>
  ),
  hall: (
    <>
      <rect width="320" height="160" fill="#10372d" />
      <rect y="112" width="320" height="48" fill="#0b2a22" />
      <path d="M60 112V68l100-38 100 38v44z" fill="#1b7a5d" />
      <path d="M48 70 160 26l112 44" stroke="#d8efe4" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".9" />
      <rect x="138" y="76" width="44" height="36" rx="4" fill="#0b2a22" />
      <rect x="82" y="80" width="34" height="26" rx="3" fill="#e7e2d6" opacity=".85" />
      <rect x="204" y="80" width="34" height="26" rx="3" fill="#e7e2d6" opacity=".85" />
      <circle cx="268" cy="38" r="12" fill="#c9973f" opacity=".9" />
    </>
  ),
  garden: (
    <>
      <rect width="320" height="160" fill="#10372d" />
      <ellipse cx="160" cy="150" rx="190" ry="44" fill="#1b7a5d" />
      <g>
        <rect x="76" y="78" width="9" height="52" rx="3" fill="#0b2a22" />
        <circle cx="80" cy="64" r="30" fill="#2b9a74" />
        <rect x="236" y="88" width="8" height="42" rx="3" fill="#0b2a22" />
        <circle cx="240" cy="76" r="24" fill="#86b9a2" />
      </g>
      <path d="M128 122h64l-8-26h-48z" fill="#e7e2d6" opacity=".9" />
      <circle cx="270" cy="30" r="11" fill="#c9973f" opacity=".9" />
    </>
  ),
};

export default function AmenityArt({ name, className = "" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 320 160"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={`block w-full ${className}`}
    >
      {scenes[kindOf(name)]}
    </svg>
  );
}
