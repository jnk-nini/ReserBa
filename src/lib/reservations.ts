import type { Payment, Reservation } from "./types";
import { sumMoney } from "./money";

// A reservation as the detail screens read it: with its amenity, the person
// who booked, its equipment lines, and its payments.
export type ReservationDetail = Reservation & {
  amenities: { name: string } | null;
  booker: { full_name: string; contact_no: string | null } | null;
  reservation_equipment: Array<{
    id: number;
    quantity: number;
    lent_at: string | null;
    returned_at: string | null;
    return_condition: string | null;
    equipment: { name: string; rate: number } | null;
  }>;
  payments: Payment[];
};

// The columns asked from the database for a ReservationDetail. The users table
// is linked twice (who booked, who typed it in), so the link is named.
export const reservationDetailColumns =
  "*, amenities(name), booker:users!reservations_user_id_fkey(full_name, contact_no), " +
  "reservation_equipment(id, quantity, lent_at, returned_at, return_condition, equipment(name, rate)), " +
  "payments(*)";

// Who the reservation is for, in words.
export function bookedBy(reservation: Pick<ReservationDetail, "guest_name" | "booker">) {
  if (reservation.guest_name && reservation.booker) {
    return `${reservation.guest_name} (guest of ${reservation.booker.full_name})`;
  }
  return reservation.guest_name ?? reservation.booker?.full_name ?? "Unknown";
}

// How much of the fee and of the deposit the HOA has confirmed so far.
// Only payments an administrator recorded count; void ones never do.
export function paidSoFar(payments: Payment[]) {
  const recorded = payments.filter((payment) => payment.status === "recorded");
  return {
    fee: sumMoney(recorded.filter((payment) => payment.kind === "fee").map((payment) => payment.amount)),
    deposit: sumMoney(recorded.filter((payment) => payment.kind === "deposit").map((payment) => payment.amount)),
  };
}

// The number people say out loud: the reference number once approved,
// otherwise the request number.
export function displayNumber(reservation: Pick<Reservation, "reference_no" | "reservation_id">) {
  return reservation.reference_no ?? `Request #${reservation.reservation_id}`;
}
