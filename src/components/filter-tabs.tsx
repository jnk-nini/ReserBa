import Link from "next/link";

// A row of pills that filters a list ("Waiting", "Approved", ...). The chosen
// pill is dark. On a phone the row scrolls sideways and runs to the screen edge.
export default function FilterTabs({
  label,
  basePath,
  tabs,
  current,
}: {
  label: string;
  basePath: string;
  tabs: Array<{ key: string; label: string }>;
  current: string;
}) {
  return (
    <nav
      aria-label={label}
      className="-mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`${basePath}?show=${tab.key}`}
          aria-current={current === tab.key ? "page" : undefined}
          className={`shrink-0 rounded-full border px-4 py-2 text-[0.9375rem] font-medium whitespace-nowrap transition-colors duration-150 ${
            current === tab.key
              ? "border-ink bg-ink text-surface"
              : "border-line-strong bg-surface text-ink hover:border-ink-soft/60"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
