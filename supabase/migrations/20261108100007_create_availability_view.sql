-- Availability: what the calendar needs and nothing more. For each amenity, the
-- time ranges that are taken (pending or approved reservations, and blocked
-- dates), with no names. Residents cannot read other people's reservations or
-- the blocked dates table, so they read this view instead.
--
-- The view runs with its owner's rights on purpose (that is how it can show the
-- ranges), so what it exposes is limited to the columns below.
-- end_at is the end of the reservation plus its buffer: the moment the next
-- booking may start.
-- See docs/database-schema.md, section 4.

create view public.availability as
select
  amenity_id,
  start_at,
  occupied_until as end_at,
  status as kind
from public.reservations
where status in ('pending', 'approved')
union all
select
  amenity_id,
  start_at,
  end_at,
  'blocked' as kind
from public.blocked_dates;

revoke all on public.availability from public, anon, authenticated;
grant select on public.availability to authenticated;
