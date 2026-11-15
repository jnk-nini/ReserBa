// Shown at once when a person opens another screen, while its data is on the
// way. The menu stays in place; only the page area shows these grey blocks.
export default function Loading() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">
        Loading
      </p>
      <div className="skeleton h-10 w-64 max-w-full" />
      <div className="skeleton mt-3 h-5 w-96 max-w-full" />
      <div className="skeleton mt-9 h-36 w-full rounded-2xl" />
      <div className="skeleton mt-4 h-36 w-full rounded-2xl" />
    </div>
  );
}
