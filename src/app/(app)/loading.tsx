import Spinner from "@/components/spinner";

// Shown at once when a person opens another screen, while its data is on the
// way. The menu stays in place; only the page area shows a small turning ring
// and these grey blocks. It fades in after a beat, so a fast screen does not
// flash.
export default function Loading() {
  return (
    <div aria-busy="true" className="animate-fade-in [animation-delay:150ms]">
      <p className="flex items-center gap-2 text-sm text-ink-soft" role="status">
        <Spinner />
        Loading
      </p>
      <div className="skeleton mt-5 h-10 w-64 max-w-full" />
      <div className="skeleton mt-3 h-5 w-96 max-w-full" />
      <div className="skeleton mt-9 h-36 w-full rounded-2xl" />
      <div className="skeleton mt-4 h-36 w-full rounded-2xl" />
    </div>
  );
}
