"use client";

// Opens the browser's print window. On a phone this also offers "Save as PDF".
export default function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-primary">
      {label}
    </button>
  );
}
