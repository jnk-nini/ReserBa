-- Row Level Security: who can see and change which rows.
-- Every table was created with row level security turned on and no policies,
-- which means nobody could read or write anything. These policies open exactly
-- what each role needs. The plain-word table is in docs/database-schema.md,
-- section 4.
--
-- (select auth.uid()) is the signed-in user. It is wrapped in a select so
-- Postgres evaluates it once per query instead of once per row.
-- Who may change which column inside a row is handled by triggers, not here.

-- Table privileges ------------------------------------------------------
-- A role first needs the privilege to touch a table at all; row level security
-- then decides which rows. On a new Supabase project the signed-in role
-- (authenticated) and the anonymous role get no read or write privilege on new
-- tables, so without this section the app could not use any table.
-- Take everything away first (this also removes TRUNCATE), then give back only
-- what the screens need. Anonymous visitors get nothing. Deleting is allowed
-- only where a delete policy below exists; reservations, payments, and the
-- audit log are never deleted.
revoke all on
  public.users, public.amenities, public.blocked_dates, public.reservations,
  public.payments, public.audit_logs
  from anon, authenticated;

grant select, update on public.users to authenticated;
grant select, insert, update, delete on public.amenities to authenticated;
grant select, insert, update, delete on public.blocked_dates to authenticated;
grant select, insert, update on public.reservations to authenticated;
grant select, insert, update on public.payments to authenticated;
grant select on public.audit_logs to authenticated;

-- users -----------------------------------------------------------------
create policy "users: read own row, admin reads all"
  on public.users for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "users: update own row"
  on public.users for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "users: admin updates all"
  on public.users for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- amenities -------------------------------------------------------------
create policy "amenities: active ones for everyone, all for admin and guard"
  on public.amenities for select to authenticated
  using (is_active or (select public.is_admin()) or (select public.is_guard()));

create policy "amenities: admin adds"
  on public.amenities for insert to authenticated
  with check ((select public.is_admin()));

create policy "amenities: admin edits"
  on public.amenities for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "amenities: admin removes"
  on public.amenities for delete to authenticated
  using ((select public.is_admin()));

-- blocked_dates (residents see them only through the availability view) --
create policy "blocked_dates: admin does everything"
  on public.blocked_dates for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- reservations (never deleted: cancel or reject instead) ----------------
create policy "reservations: read own, admin reads all"
  on public.reservations for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "reservations: resident asks for their own"
  on public.reservations for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and created_by = (select auth.uid())
    and status = 'pending'
  );

create policy "reservations: admin encodes any"
  on public.reservations for insert to authenticated
  with check ((select public.is_admin()));

create policy "reservations: resident cancels own pending"
  on public.reservations for update to authenticated
  using (user_id = (select auth.uid()) and status = 'pending')
  with check (user_id = (select auth.uid()) and status = 'cancelled');

create policy "reservations: admin updates"
  on public.reservations for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- payments (never deleted: void instead) --------------------------------
create policy "payments: read own, admin reads all"
  on public.payments for select to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.reservations r
      where r.reservation_id = payments.reservation_id
        and r.user_id = (select auth.uid())
    )
  );

create policy "payments: resident submits proof for their own reservation"
  on public.payments for insert to authenticated
  with check (
    status = 'submitted'
    and recorded_by is null
    and exists (
      select 1 from public.reservations r
      where r.reservation_id = payments.reservation_id
        and r.user_id = (select auth.uid())
    )
  );

create policy "payments: admin adds"
  on public.payments for insert to authenticated
  with check ((select public.is_admin()));

create policy "payments: admin updates"
  on public.payments for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- audit_logs (read only; the triggers write it) ---------------------------
create policy "audit_logs: admin reads"
  on public.audit_logs for select to authenticated
  using ((select public.is_admin()));
