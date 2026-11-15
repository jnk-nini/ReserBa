import Icon, { type IconName } from "./icons";

// What a list shows when it has nothing yet: a calm icon, one clear sentence,
// and the next step.
export default function EmptyState({
  icon = "calendar",
  title,
  children,
  action,
}: {
  icon?: IconName;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-brand-tint text-brand">
        <Icon name={icon} className="size-6" />
      </span>
      <p className="mt-4 text-base font-semibold">{title}</p>
      {children && <p className="mt-1 max-w-sm text-[0.9375rem] text-ink-soft">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
