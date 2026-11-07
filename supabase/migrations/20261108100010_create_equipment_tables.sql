-- ADD-ON (optional): equipment that can be borrowed with a reservation, such as
-- tables, chairs, and a sound system. Nothing else in the database depends on
-- this file. To cut the feature, drop reservation_equipment and equipment and
-- the two functions at the bottom (use "cascade" to remove their triggers).
-- See docs/database-schema.md, section 2 and Rule 2.

create table public.equipment (
  equipment_id bigint generated always as identity primary key,
  name text not null check (length(trim(name)) > 0),
  -- Units the association owns.
  total_quantity integer not null check (total_quantity >= 0),
  rate numeric(10, 2) not null default 0 check (rate >= 0),
  condition text,
  created_at timestamptz not null default now()
);

create table public.reservation_equipment (
  id bigint generated always as identity primary key,
  reservation_id bigint not null references public.reservations (reservation_id),
  equipment_id bigint not null references public.equipment (equipment_id),
  quantity integer not null check (quantity > 0),
  lent_at timestamptz,
  returned_at timestamptz,
  return_condition text,
  created_at timestamptz not null default now(),
  constraint reservation_equipment_one_line_per_item unique (reservation_id, equipment_id)
);

alter table public.equipment enable row level security;
alter table public.reservation_equipment enable row level security;

-- Table privileges (see the row level security migration for why).
revoke all on public.equipment, public.reservation_equipment from anon, authenticated;
grant select, insert, update, delete on public.equipment to authenticated;
grant select, insert, update, delete on public.reservation_equipment to authenticated;

-- Rule 2: never lend more than the association owns.
-- The equipment row is locked first, so two requests for the last units at the
-- same moment wait for each other instead of both succeeding (test T30).
-- It counts the units already requested by other pending or approved
-- reservations that overlap this one in time (buffer included). That is
-- careful on purpose: it may refuse something that would have fitted, but it
-- never allows more than exists.
create function public.reservation_equipment_check_quantity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total integer;
  v_taken integer;
  v_range tstzrange;
begin
  if tg_op = 'UPDATE' and new.reservation_id <> old.reservation_id then
    raise exception 'An equipment line cannot move to another reservation. Remove it and add it again.';
  end if;

  select total_quantity into v_total
  from public.equipment
  where equipment_id = new.equipment_id
  for update;

  select tstzrange(start_at, occupied_until) into v_range
  from public.reservations
  where reservation_id = new.reservation_id;

  select coalesce(sum(re.quantity), 0) into v_taken
  from public.reservation_equipment re
  join public.reservations r on r.reservation_id = re.reservation_id
  where re.equipment_id = new.equipment_id
    and re.id <> new.id
    and r.status in ('pending', 'approved')
    and tstzrange(r.start_at, r.occupied_until) && v_range;

  if v_taken + new.quantity > v_total then
    raise exception 'Not enough of this equipment: % of % already requested for this time.',
      v_taken, v_total;
  end if;

  return new;
end;
$$;

revoke execute on function public.reservation_equipment_check_quantity()
  from public, anon, authenticated;

create trigger reservation_equipment_check_quantity
  before insert or update of quantity, equipment_id, reservation_id
  on public.reservation_equipment
  for each row execute function public.reservation_equipment_check_quantity();

-- The reservation fee includes the equipment: time fee plus quantity times rate.
create function public.reservation_equipment_update_fee()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reservation_id bigint := coalesce(new.reservation_id, old.reservation_id);
begin
  update public.reservations r
  set total_fee =
    public.base_rental_fee(r.amenity_id, r.start_at, r.end_at, r.guest_name is not null)
    + coalesce((
        select sum(re.quantity * e.rate)
        from public.reservation_equipment re
        join public.equipment e on e.equipment_id = re.equipment_id
        where re.reservation_id = r.reservation_id
      ), 0)
  where r.reservation_id = v_reservation_id;
  return null;
end;
$$;

revoke execute on function public.reservation_equipment_update_fee()
  from public, anon, authenticated;

create trigger reservation_equipment_update_fee
  after insert or update of quantity, equipment_id or delete
  on public.reservation_equipment
  for each row execute function public.reservation_equipment_update_fee();

-- Audit: changes to the inventory are logged.
create trigger audit_equipment
  after insert or update or delete on public.equipment
  for each row execute function public.write_audit_log('equipment_id');

-- Row level security ------------------------------------------------------
create policy "equipment: everyone signed in can read"
  on public.equipment for select to authenticated
  using (true);

create policy "equipment: admin adds"
  on public.equipment for insert to authenticated
  with check ((select public.is_admin()));

create policy "equipment: admin edits"
  on public.equipment for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "equipment: admin removes"
  on public.equipment for delete to authenticated
  using ((select public.is_admin()));

create policy "reservation_equipment: read own, admin reads all"
  on public.reservation_equipment for select to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.reservations r
      where r.reservation_id = reservation_equipment.reservation_id
        and r.user_id = (select auth.uid())
    )
  );

create policy "reservation_equipment: resident adds to their own pending reservation"
  on public.reservation_equipment for insert to authenticated
  with check (
    exists (
      select 1 from public.reservations r
      where r.reservation_id = reservation_equipment.reservation_id
        and r.user_id = (select auth.uid())
        and r.status = 'pending'
    )
  );

create policy "reservation_equipment: admin does everything else"
  on public.reservation_equipment for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
