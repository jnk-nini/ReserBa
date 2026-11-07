-- Payments: money received for a reservation. A resident uploads proof (status
-- "submitted"), then an administrator confirms it ("recorded"). A wrong payment
-- is voided with a reason. Payments are never deleted.
-- See docs/database-schema.md, section 2.

create table public.payments (
  payment_id bigint generated always as identity primary key,
  reservation_id bigint not null references public.reservations (reservation_id),
  -- The administrator who confirmed it. Empty while only the proof exists.
  recorded_by uuid references public.users (user_id),
  -- fee and deposit are kept apart so reports do not mix them.
  kind text not null default 'fee' check (kind in ('fee', 'deposit')),
  amount numeric(10, 2) not null check (amount > 0),
  method text not null check (method in ('cash', 'e-wallet')),
  status text not null default 'submitted'
    check (status in ('submitted', 'recorded', 'void')),
  void_reason text,
  paid_at timestamptz,
  -- Path of the proof file in the private bucket, not a public link.
  proof_url text,
  created_at timestamptz not null default now(),

  constraint payments_void_needs_reason
    check (status <> 'void' or length(trim(coalesce(void_reason, ''))) > 0),
  constraint payments_recorded_needs_admin
    check (status <> 'recorded' or (recorded_by is not null and paid_at is not null))
);

create index payments_reservation_idx on public.payments (reservation_id);

alter table public.payments enable row level security;

create function public.payments_before_save()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if tg_op = 'DELETE' then
    raise exception 'Payments are voided, never deleted.';
  end if;

  if tg_op = 'INSERT' then
    -- A resident can only submit proof. Confirming is for administrators.
    if v_uid is not null and not public.is_admin() then
      new.status := 'submitted';
      new.recorded_by := null;
      new.void_reason := null;
    end if;

    if not exists (
      select 1 from public.reservations
      where reservation_id = new.reservation_id and status in ('pending', 'approved')
    ) then
      raise exception 'A payment needs a pending or approved reservation.';
    end if;
  else
    -- A voided payment is final. A recorded one can only be voided.
    if old.status = 'void' then
      raise exception 'A void payment cannot be changed.';
    end if;
    if old.status = 'recorded' then
      if new.status <> 'void' then
        raise exception 'A recorded payment can only be voided.';
      end if;
      if (new.reservation_id, new.kind, new.amount, new.method, new.paid_at,
          new.proof_url, new.recorded_by)
         is distinct from
         (old.reservation_id, old.kind, old.amount, old.method, old.paid_at,
          old.proof_url, old.recorded_by) then
        raise exception 'Only the void reason can be added to a recorded payment.';
      end if;
    end if;
  end if;

  -- Recording: stamp who and when.
  if new.status = 'recorded' and (tg_op = 'INSERT' or old.status <> 'recorded') then
    new.recorded_by := coalesce(new.recorded_by, v_uid);
    new.paid_at := coalesce(new.paid_at, now());
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke execute on function public.payments_before_save() from public, anon, authenticated;

create trigger payments_before_save
  before insert or update or delete on public.payments
  for each row execute function public.payments_before_save();
