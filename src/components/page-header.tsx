import Link from "next/link";
import Icon from "./icon";

// The title block at the top of every screen. `back` is the way up to the list
// this screen belongs to, shown as a small link above the title. `children`
// are the actions of the screen, with the main one last.
export default function PageHeader({
  title,
  description,
  back,
  children,
}: {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-6 sm:mb-9">
      {back && (
        <Link
          href={back.href}
          className="no-print group -ml-1 mb-3 inline-flex min-h-8 items-center gap-1.5 rounded-lg px-1 text-sm font-medium text-ink-soft transition-colors duration-150 hover:text-ink"
        >
          <Icon
            name="arrow-left"
            className="size-4 transition-transform duration-200 ease-settle group-hover:-translate-x-0.5"
          />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="display text-[2rem] sm:text-[2.5rem]">{title}</h1>
          {description && <p className="mt-2 max-w-prose text-[0.9375rem] text-ink-soft">{description}</p>}
        </div>
        {children && <div className="no-print flex flex-wrap gap-2">{children}</div>}
      </div>
    </header>
  );
}
