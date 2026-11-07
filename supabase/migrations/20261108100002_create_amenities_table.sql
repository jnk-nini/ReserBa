-- Amenities: things that can be reserved (court, clubhouse, pool, gazebo).
-- Every rule an association may want to change (hours, buffer, rates) is a
-- column here, not something written in the code.
-- See docs/database-schema.md, section 2.

create table public.amenities (
  amenity_id bigint generated always as identity primary key,
  name text not null check (length(trim(name)) > 0),
  type text not null,
  open_time time not null,
  close_time time not null,
  -- Minutes that must stay free after each reservation (cleaning, turnover).
  buffer_minutes integer not null default 0 check (buffer_minutes >= 0),
  rate_resident numeric(10, 2) not null default 0 check (rate_resident >= 0),
  rate_nonresident numeric(10, 2) not null default 0 check (rate_nonresident >= 0),
  deposit numeric(10, 2) not null default 0 check (deposit >= 0),
  -- false hides the amenity from booking without deleting its history.
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint amenities_close_after_open check (close_time > open_time)
);

alter table public.amenities enable row level security;
