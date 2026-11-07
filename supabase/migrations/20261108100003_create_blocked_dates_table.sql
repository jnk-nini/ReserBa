-- Blocked dates: ranges the association keeps for itself (assembly, repairs).
-- Residents cannot book over them. The check that refuses a booking inside a
-- block lives with the reservations table, in the next migration.
-- See docs/database-schema.md, section 2.

create table public.blocked_dates (
  block_id bigint generated always as identity primary key,
  amenity_id bigint not null references public.amenities (amenity_id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text not null check (length(trim(reason)) > 0),
  created_by uuid not null references public.users (user_id),
  created_at timestamptz not null default now(),
  constraint blocked_dates_end_after_start check (end_at > start_at)
);

create index blocked_dates_amenity_idx on public.blocked_dates (amenity_id, start_at);

alter table public.blocked_dates enable row level security;
