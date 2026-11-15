// Shown inside the frame while a screen's data loads.
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="skeleton mb-2 h-8 w-56" />
      <div className="skeleton mb-8 h-4 w-80 max-w-full" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="skeleton h-28" />
        <div className="skeleton h-28" />
        <div className="skeleton h-28" />
      </div>
      <div className="skeleton mt-6 h-64" />
    </div>
  );
}
