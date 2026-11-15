import Icon, { type IconName } from "./icon";

// What a list shows when it has nothing yet. It says what the list is for and
// offers the next step, instead of a bare "Nothing here".
export default function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: IconName;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-tint text-brand">
        <Icon name={icon} className="size-6" />
      </span>
      <p className="mt-4 text-base font-semibold">{title}</p>
      {children && <p className="mt-1 max-w-sm text-[0.9375rem] text-ink-soft">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
