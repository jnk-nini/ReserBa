// The shape of the rows the screens read. Names match docs/database-schema.md.

export type Role = "resident" | "admin" | "guard";
export type ResidencyStatus = "pending" | "verified" | "rejected";
export type ReservationStatus = "pending" | "approved" | "rejected" | "cancelled";
export type PaymentStatus = "submitted" | "recorded" | "void";

export type UserRow = {
  user_id: string;
  full_name: string;
  email: string;
  contact_no: string | null;
  address: string | null;
  role: Role;
  resident_type: "homeowner" | "tenant" | null;
  residency_status: ResidencyStatus;
  proof_of_residency_url: string | null;
  residency_note: string | null;
  created_at: string;
};

export type Amenity = {
  amenity_id: number;
  name: string;
  type: string;
  open_time: string;
  close_time: string;
  buffer_minutes: number;
  rate_resident: number;
  rate_nonresident: number;
  deposit: number;
  is_active: boolean;
};

export type Equipment = {
  equipment_id: number;
  name: string;
  total_quantity: number;
  rate: number;
  condition: string | null;
};

export type Reservation = {
  reservation_id: number;
  reference_no: string | null;
  amenity_id: number;
  user_id: string | null;
  guest_name: string | null;
  created_by: string;
  start_at: string;
  end_at: string;
  occupied_until: string;
  status: ReservationStatus;
  total_fee: number;
  deposit: number;
  reject_reason: string | null;
  created_at: string;
};

export type Payment = {
  payment_id: number;
  reservation_id: number;
  recorded_by: string | null;
  kind: "fee" | "deposit";
  amount: number;
  method: "cash" | "e-wallet";
  status: PaymentStatus;
  void_reason: string | null;
  paid_at: string | null;
  proof_url: string | null;
  created_at: string;
};

// One taken time range from the availability view.
export type TakenRange = {
  amenity_id: number;
  start_at: string;
  end_at: string;
  kind: "pending" | "approved" | "blocked";
};

// What a server action sends back to its form.
export type FormState = { error?: string; ok?: string };
