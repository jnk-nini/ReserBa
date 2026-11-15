-- Database rule tests: the 30 conflict cases of Appendix D (T01 to T30) and the
-- role access checks (R01 onward).
--
-- How to run it:
--   Supabase dashboard: paste the whole file into the SQL editor and press Run.
--   Command line:       psql "<connection string>" -f supabase/tests/database_rules_test.sql
--
-- Everything happens inside one transaction that is rolled back at the end, so
-- the test users, amenities, and bookings never stay in the database.
-- The last result is a table with one row per test: expected, actual, pass.
--
-- T23 and T30 need two people saving at the same moment. One connection cannot
-- do that, so here they are run one right after the other (the second must be
-- refused). The true simultaneous run is in supabase/tests/simultaneous_test.sh.

begin;

create temp table test_results (
  test_id text,
  scenario text,
  expected text,
  actual text,
  pass boolean
) on commit drop;

-- A date 30 days from now (Philippine time) so no test is "in the past".
create function pg_temp.at(p_time text, p_day_offset integer default 0)
returns timestamptz
language sql
as $$
  select (((now() at time zone 'Asia/Manila')::date + 30 + p_day_offset)::text || ' ' || p_time)::timestamp
         at time zone 'Asia/Manila';
$$;

-- Runs one statement as the given signed-in user and reports what happened.
-- With p_keep = false the statement is undone afterwards, so each test starts
-- from the same data.
create function pg_temp.attempt(p_user uuid, p_sql text, p_keep boolean default false)
returns text
language plpgsql
as $$
declare
  v_rows bigint;
  v_result text;
begin
  perform set_config('request.jwt.claim.sub', p_user::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  begin
    set local role authenticated;
    execute p_sql;
    get diagnostics v_rows = row_count;
    v_result := case when v_rows = 0 then 'no rows' else 'accepted' end;
    if not p_keep then
      raise exception 'UNDO_TEST_STATEMENT';
    end if;
  exception when others then
    if sqlerrm <> 'UNDO_TEST_STATEMENT' then
      v_result := 'rejected: ' || sqlerrm;
    end if;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);
  return v_result;
end;
$$;

-- Writes one row of the result table. A test passes when the actual result
-- starts with the expected word (accepted, rejected, or no rows).
create function pg_temp.record(p_id text, p_scenario text, p_expected text, p_actual text)
returns void
language sql
as $$
  insert into test_results values (p_id, p_scenario, p_expected, p_actual, p_actual like p_expected || '%');
$$;

-- Builds the insert statement for a booking.
create function pg_temp.booking(p_amenity bigint, p_start timestamptz, p_end timestamptz, p_user uuid,
                                p_guest text default null)
returns text
language sql
as $$
  select format(
    'insert into public.reservations (amenity_id, user_id, created_by, start_at, end_at, guest_name)
     values (%s, %L, %L, %L, %L, %L)',
    p_amenity, p_user, p_user, p_start, p_end, p_guest);
$$;

------------------------------------------------------------------------
-- Sample data
------------------------------------------------------------------------
do $$
declare
  v_meta jsonb := '{"consent": "true", "contact_no": "09170000000", "address": "Block 1 Lot 1"}';
begin
  insert into auth.users (id, email, raw_user_meta_data) values
    ('00000000-0000-4000-a000-000000000001', 'test.admin@reserba.test',  v_meta || '{"full_name": "Test Admin"}'),
    ('00000000-0000-4000-a000-000000000002', 'test.guard@reserba.test',  v_meta || '{"full_name": "Test Guard"}'),
    ('00000000-0000-4000-a000-000000000003', 'test.ana@reserba.test',    v_meta || '{"full_name": "Ana Resident"}'),
    ('00000000-0000-4000-a000-000000000004', 'test.ben@reserba.test',    v_meta || '{"full_name": "Ben Resident"}'),
    ('00000000-0000-4000-a000-000000000005', 'test.new@reserba.test',    v_meta || '{"full_name": "New Signup"}');
end;
$$;

update public.users set role = 'admin' where email = 'test.admin@reserba.test';
update public.users set role = 'guard' where email = 'test.guard@reserba.test';
update public.users set residency_status = 'verified', resident_type = 'homeowner'
  where email in ('test.ana@reserba.test', 'test.ben@reserba.test');

create temp table ids on commit drop as
select
  '00000000-0000-4000-a000-000000000001'::uuid as admin,
  '00000000-0000-4000-a000-000000000002'::uuid as guard,
  '00000000-0000-4000-a000-000000000003'::uuid as ana,
  '00000000-0000-4000-a000-000000000004'::uuid as ben,
  '00000000-0000-4000-a000-000000000005'::uuid as newbie,
  null::bigint as clubhouse, null::bigint as court, null::bigint as pool,
  null::bigint as tables, null::bigint as chairs;
grant select on ids to authenticated;

with a as (
  insert into public.amenities (name, type, open_time, close_time, buffer_minutes, rate_resident, rate_nonresident, deposit)
  values ('Test Clubhouse', 'clubhouse', '08:00', '22:00', 60, 500, 800, 1000)
  returning amenity_id
) update ids set clubhouse = (select amenity_id from a);
with a as (
  insert into public.amenities (name, type, open_time, close_time, buffer_minutes, rate_resident, rate_nonresident, deposit)
  values ('Test Court', 'court', '06:00', '22:00', 0, 100, 150, 0)
  returning amenity_id
) update ids set court = (select amenity_id from a);
with a as (
  insert into public.amenities (name, type, open_time, close_time, buffer_minutes, rate_resident, rate_nonresident, deposit)
  values ('Test Pool', 'pool', '08:00', '20:00', 30, 200, 300, 500)
  returning amenity_id
) update ids set pool = (select amenity_id from a);
with e as (
  insert into public.equipment (name, total_quantity, rate, condition) values ('Test tables', 20, 50, 'Good')
  returning equipment_id
) update ids set tables = (select equipment_id from e);
with e as (
  insert into public.equipment (name, total_quantity, rate, condition) values ('Test chairs', 15, 10, 'Good')
  returning equipment_id
) update ids set chairs = (select equipment_id from e);

------------------------------------------------------------------------
-- Conflict tests T01 to T30
------------------------------------------------------------------------
do $$
declare
  i record;
  v_existing bigint;
  v_other bigint;
  v_first text;
  v_second text;
  v_fee numeric;
begin
  select * into i from ids;

  -- The existing booking most tests refer to: Clubhouse 14:00 to 18:00, approved.
  perform pg_temp.attempt(i.ana, pg_temp.booking(i.clubhouse, pg_temp.at('14:00'), pg_temp.at('18:00'), i.ana), true);
  select reservation_id into v_existing from public.reservations where amenity_id = i.clubhouse;
  perform pg_temp.attempt(i.admin, format('update public.reservations set status = ''approved'' where reservation_id = %s', v_existing), true);

  perform pg_temp.record('T01', 'Exact same slot', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('14:00'), pg_temp.at('18:00'), i.ben)));
  perform pg_temp.record('T02', 'New starts inside existing', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('16:00'), pg_temp.at('20:00'), i.ben)));
  perform pg_temp.record('T03', 'New ends inside existing', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('12:00'), pg_temp.at('16:00'), i.ben)));
  perform pg_temp.record('T04', 'New contains existing', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('12:00'), pg_temp.at('20:00'), i.ben)));
  perform pg_temp.record('T05', 'New is inside existing', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('15:00'), pg_temp.at('17:00'), i.ben)));

  -- T06: court, buffer 0, back to back.
  perform pg_temp.attempt(i.ana, pg_temp.booking(i.court, pg_temp.at('14:00'), pg_temp.at('16:00'), i.ana), true);
  perform pg_temp.record('T06', 'Back-to-back, buffer 0', 'accepted',
    pg_temp.attempt(i.ben, pg_temp.booking(i.court, pg_temp.at('16:00'), pg_temp.at('18:00'), i.ben)));

  perform pg_temp.record('T07', 'Back-to-back, buffer 60', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('18:00'), pg_temp.at('20:00'), i.ben)));
  perform pg_temp.record('T08', 'Starts 30 min after existing ends, buffer 60', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('18:30'), pg_temp.at('20:30'), i.ben)));
  perform pg_temp.record('T09', 'Starts exactly one buffer after existing ends', 'accepted',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('19:00'), pg_temp.at('21:00'), i.ben)));
  perform pg_temp.record('T10', 'Ends 30 min before existing starts, buffer 60', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('10:00'), pg_temp.at('13:30'), i.ben)));
  perform pg_temp.record('T11', 'Ends exactly one buffer before existing starts', 'accepted',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('10:00'), pg_temp.at('13:00'), i.ben)));
  perform pg_temp.record('T12', 'Same time, different amenity', 'accepted',
    pg_temp.attempt(i.ben, pg_temp.booking(i.pool, pg_temp.at('14:00'), pg_temp.at('18:00'), i.ben)));
  perform pg_temp.record('T13', 'Same amenity and time, different day', 'accepted',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('14:00', 1), pg_temp.at('18:00', 1), i.ben)));

  -- T14 to T16 use the day after tomorrow of the test date: a pending request,
  -- then the same request rejected, then cancelled.
  perform pg_temp.attempt(i.ana, pg_temp.booking(i.clubhouse, pg_temp.at('14:00', 2), pg_temp.at('18:00', 2), i.ana), true);
  select reservation_id into v_other from public.reservations
    where amenity_id = i.clubhouse and start_at = pg_temp.at('14:00', 2);
  perform pg_temp.record('T14', 'Overlaps a pending request of another resident', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('14:00', 2), pg_temp.at('18:00', 2), i.ben)));

  perform pg_temp.attempt(i.admin, format(
    'update public.reservations set status = ''rejected'', reject_reason = ''Test'' where reservation_id = %s', v_other), true);
  perform pg_temp.record('T15', 'Overlaps a rejected request', 'accepted',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('14:00', 2), pg_temp.at('18:00', 2), i.ben)));

  perform pg_temp.attempt(i.ana, pg_temp.booking(i.clubhouse, pg_temp.at('14:00', 3), pg_temp.at('18:00', 3), i.ana), true);
  select reservation_id into v_other from public.reservations
    where amenity_id = i.clubhouse and start_at = pg_temp.at('14:00', 3);
  perform pg_temp.attempt(i.ana, format('update public.reservations set status = ''cancelled'' where reservation_id = %s', v_other), true);
  perform pg_temp.record('T16', 'Overlaps a cancelled request', 'accepted',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('14:00', 3), pg_temp.at('18:00', 3), i.ben)));

  -- T17, T18: HOA assembly 09:00 to 12:00 on day 4.
  perform pg_temp.attempt(i.admin, format(
    'insert into public.blocked_dates (amenity_id, start_at, end_at, reason, created_by) values (%s, %L, %L, ''HOA assembly'', %L)',
    i.clubhouse, pg_temp.at('09:00', 4), pg_temp.at('12:00', 4), i.admin), true);
  perform pg_temp.record('T17', 'Overlaps a blocked date', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('10:00', 4), pg_temp.at('11:00', 4), i.ben)));
  -- The paper's example ends at 08:30; the clubhouse opens at 08:00, so the
  -- booking is 08:00 to 08:30 and its 60-minute buffer runs into the block.
  perform pg_temp.record('T18', 'Ends 30 min before a blocked date, buffer 60', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('08:00', 4), pg_temp.at('08:30', 4), i.ben)));

  perform pg_temp.record('T19', 'Starts before opening time', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('07:00', 5), pg_temp.at('09:00', 5), i.ben)));
  perform pg_temp.record('T20', 'Ends after closing time', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('20:00', 5), pg_temp.at('23:00', 5), i.ben)));
  perform pg_temp.record('T21a', 'End time equal to start time', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('16:00', 5), pg_temp.at('16:00', 5), i.ben)));
  perform pg_temp.record('T21b', 'End time earlier than start time', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('17:00', 5), pg_temp.at('15:00', 5), i.ben)));
  perform pg_temp.record('T22', 'Date and time already past', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('14:00', -31), pg_temp.at('16:00', -31), i.ben)));

  -- T23: same free slot twice. The first is kept, the second must be refused.
  v_first := pg_temp.attempt(i.ana, pg_temp.booking(i.court, pg_temp.at('08:00', 6), pg_temp.at('10:00', 6), i.ana), true);
  v_second := pg_temp.attempt(i.ben, pg_temp.booking(i.court, pg_temp.at('08:00', 6), pg_temp.at('10:00', 6), i.ben));
  perform pg_temp.record('T23', 'Two requests for the same free slot (one after the other)', 'accepted then rejected',
    case when v_first = 'accepted' and v_second like 'rejected%' then 'accepted then rejected: ' || v_second
         else v_first || ' / ' || v_second end);

  -- T24: a block is added over a pending request, then the approval is tried.
  perform pg_temp.attempt(i.ana, pg_temp.booking(i.clubhouse, pg_temp.at('14:00', 7), pg_temp.at('16:00', 7), i.ana), true);
  select reservation_id into v_other from public.reservations
    where amenity_id = i.clubhouse and start_at = pg_temp.at('14:00', 7);
  perform pg_temp.attempt(i.admin, format(
    'insert into public.blocked_dates (amenity_id, start_at, end_at, reason, created_by) values (%s, %L, %L, ''Repairs'', %L)',
    i.clubhouse, pg_temp.at('13:00', 7), pg_temp.at('17:00', 7), i.admin), true);
  perform pg_temp.record('T24', 'Approval after a blocked date was added over the request', 'rejected',
    pg_temp.attempt(i.admin, format('update public.reservations set status = ''approved'' where reservation_id = %s', v_other)));

  -- T25: walk-in encoded by the administrator over the approved booking.
  perform pg_temp.record('T25', 'Walk-in that overlaps an approved booking', 'rejected',
    pg_temp.attempt(i.admin, format(
      'insert into public.reservations (amenity_id, created_by, start_at, end_at, guest_name) values (%s, %L, %L, %L, ''Walk-in Guest'')',
      i.clubhouse, i.admin, pg_temp.at('15:00'), pg_temp.at('17:00'))));

  perform pg_temp.record('T26', 'Starts before midnight and ends after midnight', 'rejected',
    pg_temp.attempt(i.ben, pg_temp.booking(i.clubhouse, pg_temp.at('22:00', 8), pg_temp.at('02:00', 9), i.ben)));

  -- T27, T28: 10 of the 20 tables are committed at the pool, 14:00 to 18:00 on
  -- day 10. A court booking at the same time asks for 10, then 11.
  perform pg_temp.attempt(i.ana, pg_temp.booking(i.pool, pg_temp.at('14:00', 10), pg_temp.at('18:00', 10), i.ana), true);
  select reservation_id into v_other from public.reservations where amenity_id = i.pool and start_at = pg_temp.at('14:00', 10);
  perform pg_temp.attempt(i.ana, format(
    'insert into public.reservation_equipment (reservation_id, equipment_id, quantity) values (%s, %s, 10)', v_other, i.tables), true);
  perform pg_temp.attempt(i.ben, pg_temp.booking(i.court, pg_temp.at('14:00', 10), pg_temp.at('18:00', 10), i.ben), true);
  select reservation_id into v_other from public.reservations where amenity_id = i.court and start_at = pg_temp.at('14:00', 10);
  perform pg_temp.record('T27', 'Equipment within quantity (10 committed + 10 of 20)', 'accepted',
    pg_temp.attempt(i.ben, format(
      'insert into public.reservation_equipment (reservation_id, equipment_id, quantity) values (%s, %s, 10)', v_other, i.tables)));
  perform pg_temp.record('T28', 'Equipment above quantity (10 committed + 11 of 20)', 'rejected',
    pg_temp.attempt(i.ben, format(
      'insert into public.reservation_equipment (reservation_id, equipment_id, quantity) values (%s, %s, 11)', v_other, i.tables)));

  -- T29: all 20 tables committed 08:00 to 10:00 on day 11, 20 asked at 14:00 to 18:00.
  perform pg_temp.attempt(i.ana, pg_temp.booking(i.court, pg_temp.at('08:00', 11), pg_temp.at('10:00', 11), i.ana), true);
  select reservation_id into v_other from public.reservations where amenity_id = i.court and start_at = pg_temp.at('08:00', 11);
  perform pg_temp.attempt(i.ana, format(
    'insert into public.reservation_equipment (reservation_id, equipment_id, quantity) values (%s, %s, 20)', v_other, i.tables), true);
  perform pg_temp.attempt(i.ben, pg_temp.booking(i.court, pg_temp.at('14:00', 11), pg_temp.at('18:00', 11), i.ben), true);
  select reservation_id into v_other from public.reservations where amenity_id = i.court and start_at = pg_temp.at('14:00', 11);
  perform pg_temp.record('T29', 'Equipment committed only in a non-overlapping slot', 'accepted',
    pg_temp.attempt(i.ben, format(
      'insert into public.reservation_equipment (reservation_id, equipment_id, quantity) values (%s, %s, 20)', v_other, i.tables)));

  -- T30: 10 + 10 of 15 chairs in two overlapping bookings, one after the other.
  perform pg_temp.attempt(i.ana, pg_temp.booking(i.pool, pg_temp.at('10:00', 12), pg_temp.at('12:00', 12), i.ana), true);
  select reservation_id into v_other from public.reservations where amenity_id = i.pool and start_at = pg_temp.at('10:00', 12);
  v_first := pg_temp.attempt(i.ana, format(
    'insert into public.reservation_equipment (reservation_id, equipment_id, quantity) values (%s, %s, 10)', v_other, i.chairs), true);
  perform pg_temp.attempt(i.ben, pg_temp.booking(i.court, pg_temp.at('10:00', 12), pg_temp.at('12:00', 12), i.ben), true);
  select reservation_id into v_other from public.reservations where amenity_id = i.court and start_at = pg_temp.at('10:00', 12);
  v_second := pg_temp.attempt(i.ben, format(
    'insert into public.reservation_equipment (reservation_id, equipment_id, quantity) values (%s, %s, 10)', v_other, i.chairs));
  perform pg_temp.record('T30', 'Two requests that together exceed the chairs owned (one after the other)', 'accepted then rejected',
    case when v_first = 'accepted' and v_second like 'rejected%' then 'accepted then rejected: ' || v_second
         else v_first || ' / ' || v_second end);

  ----------------------------------------------------------------------
  -- Fee checks (FR-14)
  ----------------------------------------------------------------------
  -- Clubhouse 14:00 to 18:00 for a resident: 4 hours x 500 = 2000, deposit 1000.
  select total_fee into v_fee from public.reservations where reservation_id = v_existing;
  perform pg_temp.record('F01', 'Resident fee: 4 hours x 500', '2000.00', v_fee::text);
  select deposit into v_fee from public.reservations where reservation_id = v_existing;
  perform pg_temp.record('F02', 'Deposit copied from the amenity', '1000.00', v_fee::text);
  -- A guest pays the non-resident rate: court 1.5 hours x 150 = 225.
  perform pg_temp.attempt(i.admin, format(
    'insert into public.reservations (amenity_id, created_by, start_at, end_at, guest_name) values (%s, %L, %L, %L, ''Fee Guest'')',
    i.court, i.admin, pg_temp.at('06:00', 13), pg_temp.at('07:30', 13)), true);
  select total_fee into v_fee from public.reservations where guest_name = 'Fee Guest';
  perform pg_temp.record('F03', 'Guest fee: 1.5 hours x 150', '225.00', v_fee::text);
  -- Pool 14:00 to 18:00 with 10 tables: 4 x 200 + 10 x 50 = 1300.
  select total_fee into v_fee from public.reservations where amenity_id = i.pool and start_at = pg_temp.at('14:00', 10);
  perform pg_temp.record('F04', 'Fee with equipment: 4 x 200 + 10 x 50', '1300.00', v_fee::text);
  -- A resident cannot type their own price.
  perform pg_temp.attempt(i.ben, format(
    'insert into public.reservations (amenity_id, user_id, created_by, start_at, end_at, total_fee, deposit)
     values (%s, %L, %L, %L, %L, 1, 0)', i.clubhouse, i.ben, i.ben, pg_temp.at('08:00', 14), pg_temp.at('10:00', 14)), true);
  select total_fee into v_fee from public.reservations where amenity_id = i.clubhouse and start_at = pg_temp.at('08:00', 14);
  perform pg_temp.record('F05', 'A typed fee is overwritten by the database', '1000.00', v_fee::text);
end;
$$;

------------------------------------------------------------------------
-- Role access tests (R01 onward)
------------------------------------------------------------------------
do $$
declare
  i record;
  v_ana_res bigint;
  v_ben_res bigint;
  v_payment bigint;
  v_count bigint;
  v_text text;
begin
  select * into i from ids;
  select min(reservation_id) into v_ana_res from public.reservations where user_id = i.ana and status = 'approved';
  select min(reservation_id) into v_ben_res from public.reservations where user_id = i.ben and status = 'pending';

  -- Residents
  perform pg_temp.record('R01', 'Resident reads another resident''s reservation', 'no rows',
    pg_temp.attempt(i.ben, format('update public.reservations set status = status where reservation_id = %s', v_ana_res)));
  perform set_config('request.jwt.claim.sub', i.ben::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', i.ben)::text, true);
  set local role authenticated;
  select count(*) into v_count from public.reservations where user_id <> i.ben or user_id is null;
  reset role;
  perform pg_temp.record('R02', 'Resident sees only their own reservations', '0', v_count::text);
  set local role authenticated;
  select count(*) into v_count from public.users where user_id <> i.ben;
  reset role;
  perform pg_temp.record('R03', 'Resident sees only their own user row', '0', v_count::text);
  set local role authenticated;
  select count(*) into v_count from public.audit_logs;
  reset role;
  perform pg_temp.record('R04', 'Resident cannot read the audit log', '0', v_count::text);
  set local role authenticated;
  select count(*) into v_count from public.blocked_dates;
  reset role;
  perform pg_temp.record('R05', 'Resident cannot read blocked dates directly', '0', v_count::text);
  set local role authenticated;
  select count(*) into v_count from public.availability;
  reset role;
  perform pg_temp.record('R06', 'Resident can read the availability view', 'yes', case when v_count > 0 then 'yes' else 'no' end);
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  perform pg_temp.record('R07', 'Resident makes themselves an administrator', 'rejected',
    pg_temp.attempt(i.ben, format('update public.users set role = ''admin'' where user_id = %L', i.ben)));
  perform pg_temp.record('R08', 'Unverified resident marks themselves verified', 'rejected',
    pg_temp.attempt(i.newbie, format(
      'update public.users set residency_status = ''verified'', resident_type = ''homeowner'' where user_id = %L', i.newbie)));
  perform pg_temp.record('R09', 'Unverified resident makes a reservation', 'rejected',
    pg_temp.attempt(i.newbie, pg_temp.booking(i.court, pg_temp.at('08:00', 15), pg_temp.at('09:00', 15), i.newbie)));
  -- The database ignores the name that was sent and books for the signed-in
  -- resident, so nothing may be saved under Ana's name here.
  perform pg_temp.attempt(i.ben, pg_temp.booking(i.court, pg_temp.at('08:00', 15), pg_temp.at('09:00', 15), i.ana), true);
  select count(*) into v_count from public.reservations where user_id = i.ana and start_at = pg_temp.at('08:00', 15);
  perform pg_temp.record('R10', 'Resident books in another resident''s name', '0', v_count::text);
  perform pg_temp.record('R11', 'Resident approves their own request', 'rejected',
    pg_temp.attempt(i.ben, format('update public.reservations set status = ''approved'' where reservation_id = %s', v_ben_res)));
  perform pg_temp.record('R12', 'Resident cancels their own pending request', 'accepted',
    pg_temp.attempt(i.ben, format('update public.reservations set status = ''cancelled'' where reservation_id = %s', v_ben_res)));
  perform pg_temp.record('R13', 'Resident cancels an approved reservation', 'no rows',
    pg_temp.attempt(i.ana, format('update public.reservations set status = ''cancelled'' where reservation_id = %s', v_ana_res)));
  perform pg_temp.record('R14', 'Resident adds an amenity', 'rejected',
    pg_temp.attempt(i.ben, 'insert into public.amenities (name, type, open_time, close_time) values (''X'', ''court'', ''08:00'', ''09:00'')'));
  perform pg_temp.record('R15', 'Resident submits proof of payment for own reservation', 'accepted',
    pg_temp.attempt(i.ana, format(
      'insert into public.payments (reservation_id, amount, method, proof_url) values (%s, 2000, ''e-wallet'', ''x/y.jpg'')', v_ana_res), true));
  select max(payment_id) into v_payment from public.payments where reservation_id = v_ana_res;
  select status into v_text from public.payments where payment_id = v_payment;
  perform pg_temp.record('R16', 'A resident''s payment is saved as submitted, never recorded', 'submitted', v_text);
  perform pg_temp.record('R17', 'Resident submits a payment for someone else''s reservation', 'rejected',
    pg_temp.attempt(i.ben, format(
      'insert into public.payments (reservation_id, amount, method) values (%s, 100, ''cash'')', v_ana_res)));
  perform pg_temp.record('R18', 'Resident marks their own payment as recorded', 'no rows',
    pg_temp.attempt(i.ana, format('update public.payments set status = ''recorded'' where payment_id = %s', v_payment)));

  perform set_config('request.jwt.claim.sub', i.ben::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', i.ben)::text, true);
  set local role authenticated;
  select count(*) into v_count from public.guard_find_reservation('RB-0001');
  reset role;
  perform pg_temp.record('R18b', 'Resident gets nothing from the guard lookup', '0', v_count::text);

  -- Guard
  perform pg_temp.record('R19', 'Guard changes a reservation', 'no rows',
    pg_temp.attempt(i.guard, format('update public.reservations set status = ''cancelled'' where reservation_id = %s', v_ana_res)));
  perform pg_temp.record('R20', 'Guard adds a reservation', 'rejected',
    pg_temp.attempt(i.guard, pg_temp.booking(i.court, pg_temp.at('08:00', 15), pg_temp.at('09:00', 15), i.guard)));
  perform pg_temp.record('R21', 'Guard records a payment', 'rejected',
    pg_temp.attempt(i.guard, format(
      'insert into public.payments (reservation_id, amount, method, status) values (%s, 100, ''cash'', ''recorded'')', v_ana_res)));
  perform set_config('request.jwt.claim.sub', i.guard::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', i.guard)::text, true);
  set local role authenticated;
  select count(*) into v_count from public.users where user_id <> i.guard;
  reset role;
  perform pg_temp.record('R22', 'Guard cannot read other people''s accounts', '0', v_count::text);
  set local role authenticated;
  select count(*) into v_count from public.guard_today;
  reset role;
  perform pg_temp.record('R22b', 'Guard reads today''s approved list without an error', 'ok', 'ok');
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  -- The shared booking function saves the request and its equipment together.
  perform pg_temp.record('R22c', 'Booking function: request with equipment is saved', 'accepted',
    pg_temp.attempt(i.ben, format(
      'select public.request_reservation(%s, %L, %L, %L::jsonb)',
      i.court, pg_temp.at('08:00', 16), pg_temp.at('09:00', 16),
      json_build_array(json_build_object('equipment_id', i.tables, 'quantity', 5))::text)));
  perform pg_temp.attempt(i.ben, format(
    'select public.request_reservation(%s, %L, %L, %L::jsonb)',
    i.court, pg_temp.at('08:00', 16), pg_temp.at('09:00', 16),
    json_build_array(json_build_object('equipment_id', i.tables, 'quantity', 21))::text), true);
  select count(*) into v_count from public.reservations where amenity_id = i.court and start_at = pg_temp.at('08:00', 16);
  perform pg_temp.record('R22d', 'Booking function: nothing is saved when the equipment is refused', '0', v_count::text);
  perform pg_temp.record('R22e', 'Booking function: an overlap gets a plain message', 'rejected: That time overlaps',
    pg_temp.attempt(i.ben, format(
      'select public.request_reservation(%s, %L, %L)', i.clubhouse, pg_temp.at('15:00'), pg_temp.at('17:00'))));

  -- A rejected resident who uploads a new proof goes back to pending.
  perform pg_temp.attempt(i.admin, format(
    'update public.users set residency_status = ''rejected'', residency_note = ''Blurry photo'' where user_id = %L', i.newbie), true);
  perform pg_temp.attempt(i.newbie, format(
    'update public.users set proof_of_residency_url = ''new/proof.jpg'' where user_id = %L', i.newbie), true);
  select residency_status into v_text from public.users where user_id = i.newbie;
  perform pg_temp.record('R22f', 'Rejected resident uploads a new proof: back to pending', 'pending', v_text);

  -- Administrator, and the audit trail
  perform pg_temp.record('R23', 'Administrator records the submitted payment', 'accepted',
    pg_temp.attempt(i.admin, format('update public.payments set status = ''recorded'' where payment_id = %s', v_payment), true));
  perform pg_temp.record('R24', 'Administrator deletes a payment', 'rejected',
    pg_temp.attempt(i.admin, format('delete from public.payments where payment_id = %s', v_payment)));
  perform pg_temp.record('R25', 'Administrator rejects a request without a reason', 'rejected',
    pg_temp.attempt(i.admin, format('update public.reservations set status = ''rejected'' where reservation_id = %s', v_ben_res)));
  perform pg_temp.record('R26', 'Administrator changes their own role', 'rejected',
    pg_temp.attempt(i.admin, format('update public.users set role = ''resident'' where user_id = %L', i.admin)));
  perform pg_temp.record('R27', 'Administrator edits the audit log', 'rejected',
    pg_temp.attempt(i.admin, 'update public.audit_logs set action = ''x'''));
  perform pg_temp.record('R28', 'Administrator blocks a date over an approved reservation', 'rejected',
    pg_temp.attempt(i.admin, format(
      'insert into public.blocked_dates (amenity_id, start_at, end_at, reason, created_by) values (%s, %L, %L, ''Late block'', %L)',
      i.clubhouse, pg_temp.at('15:00'), pg_temp.at('16:00'), i.admin)));

  select count(*) into v_count from public.audit_logs
    where action = 'approve_reservation' and user_id = i.admin and record_id = v_ana_res::text;
  perform pg_temp.record('R29', 'Approving a request is in the audit log', '1', v_count::text);
  select count(*) into v_count from public.audit_logs
    where action = 'record_payment' and user_id = i.admin and record_id = v_payment::text;
  perform pg_temp.record('R30', 'Recording a payment is in the audit log', '1', v_count::text);
  select count(*) into v_count from public.ledger_entries where payment_id = v_payment and entry_type = 'income' and amount = 2000;
  perform pg_temp.record('R31', 'A recorded fee payment becomes ledger income', '1', v_count::text);
  perform pg_temp.attempt(i.admin, format(
    'update public.payments set status = ''void'', void_reason = ''Wrong amount'' where payment_id = %s', v_payment), true);
  select count(*) into v_count from public.ledger_entries where payment_id = v_payment and is_void;
  perform pg_temp.record('R32', 'Voiding the payment voids its ledger income', '1', v_count::text);
  select reference_no into v_text from public.reservations where reservation_id = v_ana_res;
  perform pg_temp.record('R33', 'An approved reservation has a reference number', 'RB-', coalesce(v_text, 'none'));
end;
$$;

select test_id, scenario, expected, actual, case when pass then 'PASS' else 'FAIL' end as result
from test_results
order by
  case left(test_id, 1) when 'T' then 1 when 'F' then 2 else 3 end,
  test_id;

select count(*) filter (where pass) as passed, count(*) filter (where not pass) as failed from test_results;

rollback;
