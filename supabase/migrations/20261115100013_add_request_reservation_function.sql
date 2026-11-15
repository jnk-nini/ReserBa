-- One function that saves a reservation request together with its equipment.
-- The resident booking form and the administrator walk-in form both call it,
-- so there is a single place where a request is created.
--
-- Why a function: saving the reservation and then its equipment lines from the
-- screen takes two separate calls. If the second one was refused (not enough
-- chairs), the reservation stayed saved without its equipment and kept the slot.
-- A function runs as one transaction: either everything is saved or nothing is.
--
-- It runs with the rights of the person calling it, so Row Level Security and
-- every trigger rule still apply. The overlap refusal of the exclusion
-- constraint is turned into a plain sentence here.
--
-- p_equipment is a list like [{"equipment_id": 1, "quantity": 10}].
-- p_guest_name and p_sponsor_id are for walk-ins encoded by an administrator.

create function public.request_reservation(
  p_amenity_id bigint,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_equipment jsonb default '[]'::jsonb,
  p_guest_name text default null,
  p_sponsor_id uuid default null
)
returns bigint
language plpgsql
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_reservation_id bigint;
  v_line jsonb;
  v_quantity integer;
begin
  if v_uid is null then
    raise exception 'Please log in first.';
  end if;

  begin
    insert into public.reservations (amenity_id, user_id, created_by, start_at, end_at, guest_name)
    values (
      p_amenity_id,
      -- An administrator may name a sponsor resident (or none, for a walk-in).
      -- Anyone else books for themselves; the trigger enforces this as well.
      case when public.is_admin() then p_sponsor_id else v_uid end,
      v_uid,
      p_start_at,
      p_end_at,
      nullif(trim(coalesce(p_guest_name, '')), '')
    )
    returning reservation_id into v_reservation_id;
  exception
    when exclusion_violation then
      raise exception 'That time overlaps another reservation of this amenity (the buffer time counts too). Please pick another time.';
  end;

  for v_line in select * from jsonb_array_elements(coalesce(p_equipment, '[]'::jsonb))
  loop
    v_quantity := coalesce((v_line ->> 'quantity')::integer, 0);
    if v_quantity > 0 then
      insert into public.reservation_equipment (reservation_id, equipment_id, quantity)
      values (v_reservation_id, (v_line ->> 'equipment_id')::bigint, v_quantity);
    end if;
  end loop;

  return v_reservation_id;
end;
$$;

revoke execute on function public.request_reservation(bigint, timestamptz, timestamptz, jsonb, text, uuid)
  from public, anon;
grant execute on function public.request_reservation(bigint, timestamptz, timestamptz, jsonb, text, uuid)
  to authenticated;
