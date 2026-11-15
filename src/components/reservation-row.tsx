import Link from "next/link";
import Icon from "./icon";
import StatusBadge from "./status-badge";
import { formatMoney } from "@/lib/money";
import { displayNumber } from "@/lib/reservations";
import { manilaDate, formatTime } from "@/lib/time";

// One reservation in a list: the date as a small tile (the first thing a
// person looks for), the amenity and the time range, the reference number and
// the fee, and the status. The whole row opens the reservation.

type Props = {
  href: string;
  amenity: string;
  // Who it is for. Shown on the administrator's lists only.
  forWhom?: string;
  startAt: string;
  endAt: string;
  referenceNo: string | null;
  reservationId: number;
  totalFee: number;
  status: string;
  // A short extra note, for example "proof to check".
  note?: string;
  past?: boolean;
};

export function DateTile({ value, muted = false }: { value: string; muted?: boolean }) {
  const date = new Date(`${manilaDate(value)}T00:00:00Z`);
  const month = new Intl.DateTimeFormat("en-PH", { timeZone: "UTC", month: "short" }).format(date);
  const weekday = new Intl.DateTimeFormat("en-PH", { timeZone: "UTC", weekday: "short" }).format(date);
  return (
    <span
      aria-hidden="true"
      className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border leading-none ${
        muted ? "border-line bg-ground text-ink-soft" : "border-line bg-surface text-ink"
      }`}
    >
      <span className="text-[0.6875rem] font-semibold tracking-wide uppercase">{month}</span>
      <span className="number mt-0.5 text-xl font-semibold">{date.getUTCDate()}</span>
      <span className="sr-only">{weekday}</span>
    </span>
  );
}

export default function ReservationRow({
  href,
  amenity,
  forWhom,
  startAt,
  endAt,
  referenceNo,
  reservationId,
  totalFee,
  status,
  note,
  past = false,
}: Props) {
  const number = displayNumber({ reference_no: referenceNo, reservation_id: reservationId });
  return (
    <Link href={href} className="row-link group">
      <DateTile value={startAt} muted={past || status === "cancelled" || status === "rejected"} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate text-base font-semibold">
            {amenity}
            {forWhom && <span className="font-normal text-ink-soft"> · {forWhom}</span>}
          </p>
          <StatusBadge status={status} />
        </div>
        <p className="number text-sm text-ink-soft">
          {formatTime(startAt)} to {formatTime(endAt)}
        </p>
        <p className="number mt-0.5 truncate text-[0.8125rem] text-ink-soft">
          <span className={referenceNo ? "font-mono font-medium text-ink" : ""}>{number}</span>
          {" · "}
          {formatMoney(totalFee)}
          {note && ` · ${note}`}
        </p>
      </div>
      <Icon
        name="chevron-right"
        className="size-4 text-ink-soft/50 transition-transform duration-200 ease-settle group-hover:translate-x-0.5 group-hover:text-ink-soft"
      />
    </Link>
  );
}
