-- Read-only security check for the live Supabase project.
-- Paste into the Supabase SQL editor and press Run. It changes nothing.
-- Every row should say ok. Anything that says CHECK needs a look.

-- 1. Every table in public has Row Level Security on.
select 'RLS on: ' || c.relname as item,
       case when c.relrowsecurity then 'ok' else 'CHECK: RLS is off' end as result
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'

union all
-- 2. Logged-out visitors (anon) have no direct access to any table or view.
select 'anon access: ' || table_name,
       'CHECK: anon has ' || string_agg(privilege_type, ', ')
from information_schema.role_table_grants
where table_schema = 'public' and grantee = 'anon'
group by table_name

union all
-- 3. Functions that run with extra rights have a fixed search_path and
--    cannot be called by logged-out visitors.
select 'function: ' || p.proname,
       case
         when p.proconfig is null or not exists (select 1 from unnest(p.proconfig) s where s like 'search_path=%')
           then 'CHECK: no fixed search_path'
         when has_function_privilege('anon', p.oid, 'execute')
           then 'CHECK: anon can call it'
         else 'ok'
       end
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef

union all
-- 4. Functions in public that are not part of ReserBa's migrations
--    (for example rls_auto_enable, see docs/project-status.md item 5).
select 'unknown function: ' || p.proname, 'CHECK: not in supabase/migrations'
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname not in (
    'assert_not_blocked', 'blocked_dates_check_reservations', 'guard_find_reservation',
    'handle_new_user', 'is_admin', 'is_guard', 'payments_before_save', 'payments_sync_ledger',
    'reservation_equipment_check_quantity', 'reservation_equipment_update_fee',
    'reservations_before_save', 'users_protect_columns', 'write_audit_log',
    'audit_logs_block_changes', 'base_rental_fee', 'ledger_entries_guard', 'request_reservation')

union all
-- 5. Proof buckets are private, with a size and file-type limit.
select 'bucket: ' || id,
       case
         when public then 'CHECK: bucket is public'
         when file_size_limit is null then 'CHECK: no size limit'
         when allowed_mime_types is null then 'CHECK: any file type allowed'
         else 'ok'
       end
from storage.buckets

order by 2, 1;  -- rows that say CHECK come first
