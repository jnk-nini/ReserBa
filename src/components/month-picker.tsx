// A small form that reloads the page for another month (?month=2026-11).
export default function MonthPicker({ month, action }: { month: string; action: string }) {
  return (
    <form action={action} className="no-print flex flex-wrap items-end gap-2">
      <label className="label">
        Month
        <input name="month" type="month" required defaultValue={month} className="input" />
      </label>
      <button type="submit" className="btn btn-quiet">
        Show
      </button>
    </form>
  );
}
