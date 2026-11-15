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
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-prose text-base text-ink-soft">{description}</p>}
      </div>
      {children && <div className="no-print flex flex-wrap gap-2">{children}</div>}
    </header>
  );
}
