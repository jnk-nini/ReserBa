-- Reservations: the heart of the system. One row per request, whether it came
-- from a resident or was encoded by an administrator (walk-in).
-- This file also holds the database rules that decide whether a request is
-- allowed (docs/database-schema.md, section 3, Rule 1).

-- Numbers behind the reference code, RB-0001, RB-0002, ... given on approval.
create sequence public.reservation_reference_seq;

create table public.reservations (
  reservation_id bigint generated always as identity primary key,
  reference_no text unique,
  amenity_id bigint not null references public.amenities (amenity_id),
  -- The resident who asked. Empty only for a walk-in guest with no sponsor.
  user_id uuid references public.users (user_id),
  -- Filled for a non-resident guest (sponsored or walk-in): non-resident rate applies.
  guest_name text check (guest_name is null or length(trim(guest_name)) > 0),
  -- Who typed the record in: the resident, or the administrator for a walk-in.
  created_by uuid not null references public.users (user_id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  -- end_at plus the amenity's buffer. Filled by the database, never typed.
  occupied_until timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  total_fee numeric(10, 2) not null default 0 check (total_fee >= 0),
  deposit numeric(10, 2) not null default 0 check (deposit >= 0),
  reject_reason text,
  created_at timestamptz not null default now(),

  constraint reservations_end_after_start check (end_at > start_at),
  constraint reservations_has_a_person check (user_id is not null or guest_name is not null),
  constraint reservations_reject_needs_reason
    check (status <> 'rejected' or length(trim(coalesce(reject_reason, ''))) > 0),

  -- Rule 1: two pending or approved reservations of the same amenity can never
  -- overlap, buffer included. Rejected and cancelled ones are left out, so they
  -- free their time. The end of a range is not part of it, so a booking may
  -- start exactly when the previous one (plus buffer) is over.
  constraint reservations_no_overlap
    exclude using gist (
      amenity_id with =,
      tstzrange(start_at, occupied_until) with &&
    ) where (status in ('pending', 'approved'))
);

create index reservations_user_idx on public.reservations (user_id);

alter table public.reservations enable row level security;

-- Fee for the time booked: hours times the hourly rate. Part hours are charged
-- in proportion. A guest pays the non-resident rate.
create function public.base_rental_fee(
  p_amenity_id bigint,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_is_guest boolean
)
returns numeric
language sql
stable
set search_path = ''
as $$
  select round(
    extract(epoch from (p_end_at - p_start_at)) / 3600.0
    * case when p_is_guest then a.rate_nonresident else a.rate_resident end,
    2
  )
  from public.amenities a
  where a.amenity_id = p_amenity_id;
$$;

-- Refuses a time range that touches a blocked date of the amenity.
create function public.assert_not_blocked(
  p_amenity_id bigint,
  p_from timestamptz,
  p_until timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.blocked_dates b
    where b.amenity_id = p_amenity_id
      and tstzrange(b.start_at, b.end_at) && tstzrange(p_from, p_until)
  ) then
    raise exception 'This time is blocked by the association.';
  end if;
end;
$$;

revoke execute on function public.assert_not_blocked(bigint, timestamptz, timestamptz)
  from public, anon, authenticated;

-- Runs before every insert or update on reservations.
-- It is "security definer" because a resident cannot read blocked dates or other
-- people's reservations, yet the checks must see them.
create function public.reservations_before_save()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_is_admin boolean := public.is_admin();
  v_amenity public.amenities%rowtype;
  v_start_local timestamp;
  v_end_local timestamp;
begin
  ----------------------------------------------------------------------
  -- New reservation
  ----------------------------------------------------------------------
  if tg_op = 'INSERT' then
    -- A resident can only book for themselves. An administrator may pick the
    -- sponsor resident; the person who typed it in is always recorded.
    if v_uid is not null and not v_is_admin then
      new.user_id := v_uid;
    end if;
    new.created_by := coalesce(v_uid, new.created_by);

    -- Everything starts as pending. Approval is a separate step.
    if new.status <> 'pending' then
      raise exception 'A new reservation starts as pending.';
    end if;
    new.reference_no := null;
    new.reject_reason := null;

    select * into v_amenity from public.amenities where amenity_id = new.amenity_id;
    if not found then
      raise exception 'That amenity does not exist.';
    end if;
    if not v_amenity.is_active then
      raise exception 'This amenity is not open for booking.';
    end if;

    -- Only a verified resident can make a request, or sponsor a guest.
    if new.user_id is not null and not exists (
      select 1 from public.users
      where user_id = new.user_id and role = 'resident' and residency_status = 'verified'
    ) then
      raise exception 'Only a verified resident can make a reservation.';
    end if;

    if new.end_at <= new.start_at then
      raise exception 'The end time must be later than the start time.';
    end if;
    if new.start_at < now() then
      raise exception 'The start time is in the past.';
    end if;

    -- Operating hours, read in Philippine time, all on one calendar day.
    -- A booking that runs past midnight fails here (test T26).
    v_start_local := new.start_at at time zone 'Asia/Manila';
    v_end_local := new.end_at at time zone 'Asia/Manila';
    if v_start_local::date <> v_end_local::date
       or v_start_local::time < v_amenity.open_time
       or v_end_local::time > v_amenity.close_time then
      raise exception 'Outside operating hours (% to %).',
        to_char(v_amenity.open_time, 'HH12:MI AM'),
        to_char(v_amenity.close_time, 'HH12:MI AM');
    end if;

    -- Values the database decides, whatever the screen sent.
    new.occupied_until := new.end_at + make_interval(mins => v_amenity.buffer_minutes);
    new.total_fee := public.base_rental_fee(
      new.amenity_id, new.start_at, new.end_at, new.guest_name is not null
    );
    new.deposit := v_amenity.deposit;

    perform public.assert_not_blocked(new.amenity_id, new.start_at, new.occupied_until);
    return new;
  end if;

  ----------------------------------------------------------------------
  -- Change to a saved reservation
  ----------------------------------------------------------------------
  -- Only the status and the reject reason may change.
  if (new.amenity_id, new.user_id, new.guest_name, new.created_by, new.start_at,
      new.end_at, new.occupied_until, new.deposit, new.created_at)
     is distinct from
     (old.amenity_id, old.user_id, old.guest_name, old.created_by, old.start_at,
      old.end_at, old.occupied_until, old.deposit, old.created_at) then
    raise exception 'A reservation cannot be edited. Cancel it and make a new one.';
  end if;

  -- The fee can only be changed by another trigger (equipment), never directly.
  if new.total_fee is distinct from old.total_fee and pg_trigger_depth() = 1 then
    raise exception 'The fee is set by the database and cannot be edited.';
  end if;

  -- The reference number is given once, on approval, and then stays.
  new.reference_no := old.reference_no;

  -- A resident can only cancel their own request and cannot touch the reason.
  if v_uid is not null and not v_is_admin then
    if new.reject_reason is distinct from old.reject_reason
       or (new.status is distinct from old.status and new.status <> 'cancelled') then
      raise exception 'A resident can only cancel their own reservation.';
    end if;
  end if;

  if new.status is distinct from old.status then
    if not (
      (old.status = 'pending' and new.status in ('approved', 'rejected', 'cancelled'))
      or (old.status = 'approved' and new.status = 'cancelled')
    ) then
      raise exception 'A % reservation cannot become %.', old.status, new.status;
    end if;

    if new.status = 'approved' then
      -- Check again: a block may have been added since the request was made.
      perform public.assert_not_blocked(new.amenity_id, new.start_at, new.occupied_until);
      new.reference_no := 'RB-' || lpad(
        nextval('public.reservation_reference_seq')::text, 4, '0'
      );
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.reservations_before_save() from public, anon, authenticated;

create trigger reservations_before_save
  before insert or update on public.reservations
  for each row execute function public.reservations_before_save();

-- Adding a block over an approved reservation is refused. Over a pending one it
-- is allowed, and that request can then only be rejected (it cannot be approved).
create function public.blocked_dates_check_reservations()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ref text;
begin
  if tg_op = 'UPDATE'
     and (new.amenity_id, new.start_at, new.end_at)
         is not distinct from (old.amenity_id, old.start_at, old.end_at) then
    return new;
  end if;

  select r.reference_no into v_ref
  from public.reservations r
  where r.amenity_id = new.amenity_id
    and r.status = 'approved'
    and tstzrange(r.start_at, r.occupied_until) && tstzrange(new.start_at, new.end_at)
  limit 1;

  if found then
    raise exception 'This block overlaps approved reservation %. Cancel that reservation first.', v_ref;
  end if;
  return new;
end;
$$;

revoke execute on function public.blocked_dates_check_reservations() from public, anon, authenticated;

create trigger blocked_dates_check_reservations
  before insert or update on public.blocked_dates
  for each row execute function public.blocked_dates_check_reservations();
