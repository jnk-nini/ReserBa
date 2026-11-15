// A small coloured label for a status. The same word always gets the same
// colour, on every screen.

const styles: Record<string, string> = {
  approved: "bg-approved-tint text-approved",
  verified: "bg-approved-tint text-approved",
  recorded: "bg-approved-tint text-approved",
  pending: "bg-pending-tint text-pending",
  submitted: "bg-pending-tint text-pending",
  rejected: "bg-refused-tint text-refused",
  void: "bg-refused-tint text-refused",
  cancelled: "bg-closed-tint text-closed",
};

const labels: Record<string, string> = {
  submitted: "To check",
  void: "Void",
};

export default function StatusBadge({ status }: { status: string }) {
  const label = labels[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`badge ${styles[status] ?? "bg-closed-tint text-closed"}`}>{label}</span>;
}
