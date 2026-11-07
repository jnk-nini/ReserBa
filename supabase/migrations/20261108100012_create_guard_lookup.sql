-- ADD-ON (optional): what the gate guard sees. Read only, nothing is saved.
-- A guard has no direct access to reservations or users; these two objects hand
-- over just the few details needed at the gate. Nothing else depends on this
-- file. To cut the feature, drop the view guard_today and the function
-- guard_find_reservation.
-- See docs/database-schema.md, section 4 and open decision 6.

-- Today's approved reservations (Philippine time). A reservation that runs
-- across midnight counts for both days. Only a guard or an administrator gets
-- any rows; everyone else gets an empty list.
create view public.guard_today as
select
  r.reference_no,
  a.name as amenity_name,
  r.start_at,
  r.end_at,
  coalesce(r.guest_name, u.full_name) as booked_by
from public.reservations r
join public.amenities a on a.amenity_id = r.amenity_id
left join public.users u on u.user_id = r.user_id
where r.status = 'approved'
  and r.start_at < (date_trunc('day', now() at time zone 'Asia/Manila') + interval '1 day')
                   at time zone 'Asia/Manila'
  and r.end_at > date_trunc('day', now() at time zone 'Asia/Manila') at time zone 'Asia/Manila'
  and (public.is_guard() or public.is_admin());

revoke all on public.guard_today from public, anon, authenticated;
grant select on public.guard_today to authenticated;

-- Search by reference number. Returns the reservation whatever its status, with
-- is_today, so the screen can say "valid", "not approved", or "not today".
-- Returns nothing when the number does not exist.
create function public.guard_find_reservation(p_reference_no text)
returns table (
  reference_no text,
  status text,
  amenity_name text,
  start_at timestamptz,
  end_at timestamptz,
  booked_by text,
  is_today boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    r.reference_no,
    r.status,
    a.name,
    r.start_at,
    r.end_at,
    coalesce(r.guest_name, u.full_name),
    (
      r.start_at < (date_trunc('day', now() at time zone 'Asia/Manila') + interval '1 day')
                   at time zone 'Asia/Manila'
      and r.end_at > date_trunc('day', now() at time zone 'Asia/Manila') at time zone 'Asia/Manila'
    )
  from public.reservations r
  join public.amenities a on a.amenity_id = r.amenity_id
  left join public.users u on u.user_id = r.user_id
  where r.reference_no = upper(trim(p_reference_no))
    and (public.is_guard() or public.is_admin());
$$;

revoke execute on function public.guard_find_reservation(text) from public, anon;
grant execute on function public.guard_find_reservation(text) to authenticated;
