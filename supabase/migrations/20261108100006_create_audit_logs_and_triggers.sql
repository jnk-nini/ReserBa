-- Audit log: the record of who did what. Triggers write it, so application code
-- cannot forget or skip it. Nobody edits or deletes it.
-- See docs/database-schema.md, section 2 and Rule 4.

create table public.audit_logs (
  log_id bigint generated always as identity primary key,
  -- Empty when the change was made from the Supabase dashboard.
  user_id uuid references public.users (user_id),
  -- For example approve_reservation, record_payment, void_payment.
  action text not null,
  table_name text not null,
  -- Stored as text because the tables use different id types.
  record_id text not null,
  -- The old and new values of what changed.
  details jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index audit_logs_record_idx on public.audit_logs (table_name, record_id);

alter table public.audit_logs enable row level security;

-- Nobody writes to it directly; only the trigger function below does.
revoke insert, update, delete, truncate on public.audit_logs from anon, authenticated;

create function public.audit_logs_block_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'The audit log cannot be changed or deleted.';
end;
$$;

create trigger audit_logs_block_changes
  before update or delete on public.audit_logs
  for each row execute function public.audit_logs_block_changes();

-- One function for every audited table. The trigger passes the name of the
-- table's id column, so the log can say which row changed.
create function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old jsonb;
  v_new jsonb;
  v_changed_old jsonb;
  v_changed_new jsonb;
  v_action text := lower(tg_op) || '_' || tg_table_name;
  v_details jsonb;
begin
  if tg_op = 'INSERT' then
    v_new := to_jsonb(new);
    v_details := jsonb_build_object('new', v_new);
  elsif tg_op = 'DELETE' then
    v_old := to_jsonb(old);
    v_details := jsonb_build_object('old', v_old);
  else
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);

    -- Keep only the columns that changed.
    select coalesce(jsonb_object_agg(n.key, n.value), '{}'::jsonb) into v_changed_new
    from jsonb_each(v_new) n
    where v_old -> n.key is distinct from n.value;

    if v_changed_new = '{}'::jsonb then
      return null;
    end if;

    select coalesce(jsonb_object_agg(o.key, o.value), '{}'::jsonb) into v_changed_old
    from jsonb_each(v_old) o
    where v_new -> o.key is distinct from o.value;

    v_details := jsonb_build_object('old', v_changed_old, 'new', v_changed_new);

    -- Friendlier names for the changes people look for.
    if tg_table_name = 'reservations' and v_changed_new ? 'status' then
      v_action := case v_new ->> 'status'
        when 'approved' then 'approve_reservation'
        when 'rejected' then 'reject_reservation'
        when 'cancelled' then 'cancel_reservation'
        else v_action end;
    elsif tg_table_name = 'payments' and v_changed_new ? 'status' then
      v_action := case v_new ->> 'status'
        when 'recorded' then 'record_payment'
        when 'void' then 'void_payment'
        else v_action end;
    elsif tg_table_name = 'ledger_entries' and v_changed_new ? 'is_void' then
      v_action := 'void_ledger_entry';
    elsif tg_table_name = 'users' then
      if v_changed_new ? 'role' then
        v_action := 'change_user_role';
      elsif v_changed_new ? 'residency_status' then
        v_action := case v_new ->> 'residency_status'
          when 'verified' then 'verify_resident'
          when 'rejected' then 'reject_resident'
          else v_action end;
      end if;
    end if;
  end if;

  insert into public.audit_logs (user_id, action, table_name, record_id, details)
  values (
    (select auth.uid()),
    v_action,
    tg_table_name,
    coalesce(v_new, v_old) ->> tg_argv[0],
    v_details
  );

  return null;
end;
$$;

revoke execute on function public.write_audit_log() from public, anon, authenticated;

create trigger audit_reservations
  after insert or update or delete on public.reservations
  for each row execute function public.write_audit_log('reservation_id');

create trigger audit_payments
  after insert or update or delete on public.payments
  for each row execute function public.write_audit_log('payment_id');

create trigger audit_amenities
  after insert or update or delete on public.amenities
  for each row execute function public.write_audit_log('amenity_id');

create trigger audit_blocked_dates
  after insert or update or delete on public.blocked_dates
  for each row execute function public.write_audit_log('block_id');

-- Users: only changes to role, residency status, or resident type are logged.
create trigger audit_users
  after update of role, residency_status, resident_type on public.users
  for each row execute function public.write_audit_log('user_id');
