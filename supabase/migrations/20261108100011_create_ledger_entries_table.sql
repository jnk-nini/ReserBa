-- ADD-ON (optional): the amenity fund ledger. Income comes from recorded fee
-- payments, expenses are typed in by an administrator. It is a monitoring tool,
-- not the association's official books. Nothing else depends on this file.
-- To cut the feature, drop the view fund_summary, the table ledger_entries, and
-- the function payments_sync_ledger (use "cascade" to remove its trigger).
-- See docs/database-schema.md, section 2.

create table public.ledger_entries (
  entry_id bigint generated always as identity primary key,
  entry_type text not null check (entry_type in ('income', 'expense')),
  amount numeric(10, 2) not null check (amount > 0),
  entry_date date not null default ((now() at time zone 'Asia/Manila')::date),
  -- What an expense was for. Needed for the expense report.
  description text,
  amenity_id bigint references public.amenities (amenity_id),
  payment_id bigint unique references public.payments (payment_id),
  -- Voided with a reason, never deleted.
  is_void boolean not null default false,
  void_reason text,
  created_at timestamptz not null default now(),

  -- Income always points at the payment it came from; an expense never does.
  constraint ledger_entries_income_has_payment
    check ((entry_type = 'income') = (payment_id is not null)),
  constraint ledger_entries_void_needs_reason
    check (not is_void or length(trim(coalesce(void_reason, ''))) > 0)
);

alter table public.ledger_entries enable row level security;

-- Table privileges (see the row level security migration for why). No delete.
revoke all on public.ledger_entries from anon, authenticated;
grant select, insert, update on public.ledger_entries to authenticated;

-- Income is created by the database when a fee payment is recorded, and voided
-- when that payment is voided. Nobody types income by hand.
create function public.payments_sync_ledger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.kind <> 'fee' then
    return null;
  end if;

  if new.status = 'recorded' and (tg_op = 'INSERT' or old.status <> 'recorded') then
    insert into public.ledger_entries
      (entry_type, amount, entry_date, description, amenity_id, payment_id)
    select
      'income',
      new.amount,
      (new.paid_at at time zone 'Asia/Manila')::date,
      'Fee payment for reservation ' || coalesce(r.reference_no, '#' || r.reservation_id),
      r.amenity_id,
      new.payment_id
    from public.reservations r
    where r.reservation_id = new.reservation_id;

  elsif new.status = 'void' and tg_op = 'UPDATE' and old.status <> 'void' then
    update public.ledger_entries
    set is_void = true, void_reason = new.void_reason
    where payment_id = new.payment_id and not is_void;
  end if;

  return null;
end;
$$;

revoke execute on function public.payments_sync_ledger() from public, anon, authenticated;

create trigger payments_sync_ledger
  after insert or update on public.payments
  for each row execute function public.payments_sync_ledger();

-- Protect the ledger: a voided entry is final, income cannot be rewritten, and
-- nothing is deleted.
create function public.ledger_entries_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Ledger entries are voided, never deleted.';
  end if;
  if old.is_void then
    raise exception 'A void ledger entry cannot be changed.';
  end if;
  if old.entry_type = 'income'
     and (new.entry_type, new.amount, new.entry_date, new.payment_id)
         is distinct from
         (old.entry_type, old.amount, old.entry_date, old.payment_id) then
    raise exception 'Income comes from a payment. Void the payment instead.';
  end if;
  return new;
end;
$$;

create trigger ledger_entries_guard
  before update or delete on public.ledger_entries
  for each row execute function public.ledger_entries_guard();

create trigger audit_ledger_entries
  after insert or update or delete on public.ledger_entries
  for each row execute function public.write_audit_log('entry_id');

-- Monthly totals of entries that are not void. Residents may read this summary
-- (FR-23) but not the entries themselves. The view runs with its owner's rights
-- on purpose, and shows totals only.
create view public.fund_summary as
select
  date_trunc('month', entry_date)::date as month,
  coalesce(sum(amount) filter (where entry_type = 'income'), 0) as income,
  coalesce(sum(amount) filter (where entry_type = 'expense'), 0) as expense
from public.ledger_entries
where not is_void
group by 1;

revoke all on public.fund_summary from public, anon, authenticated;
grant select on public.fund_summary to authenticated;

-- Row level security: administrators only. Income is created by the trigger, so
-- an administrator can add expenses only.
create policy "ledger_entries: admin reads"
  on public.ledger_entries for select to authenticated
  using ((select public.is_admin()));

create policy "ledger_entries: admin adds expenses"
  on public.ledger_entries for insert to authenticated
  with check ((select public.is_admin()) and entry_type = 'expense');

create policy "ledger_entries: admin updates"
  on public.ledger_entries for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
