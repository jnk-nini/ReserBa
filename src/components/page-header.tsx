// The title block at the top of every screen.
export default function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 sm:mb-8">
      <div className="min-w-0">
        <h1 className="text-[1.625rem] leading-tight font-semibold tracking-tight sm:text-[1.875rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-prose text-[0.9375rem] text-ink-soft">{description}</p>}
      </div>
      {children && <div className="no-print flex flex-wrap gap-2">{children}</div>}
    </header>
  );
}
