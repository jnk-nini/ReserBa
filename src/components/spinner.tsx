// A small ring that turns. It sits inside a button while that button saves,
// and next to the word "Loading" while a screen is on its way.
export default function Spinner({ className = "" }: { className?: string }) {
  return <span className={`spinner ${className}`} aria-hidden="true" />;
}
