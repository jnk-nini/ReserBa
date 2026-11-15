#!/bin/bash
# Tests T23 and T30 of Appendix D: two requests saved at the same moment.
# Two database connections start a save at the same time; exactly one of each
# pair must be accepted.
#
# Run it only against a local or test database, never the live one: it leaves
# its sample rows behind (reservations are never deleted).
#
#   ./supabase/tests/simultaneous_test.sh "postgresql://postgres:password@localhost:5432/postgres"

set -u
DB="${1:?Give the connection string of a TEST database as the first argument.}"
run() { psql "$DB" -X -q -t -A -v ON_ERROR_STOP=1 "$@"; }

# Sample data: one verified resident, a court, and 15 chairs.
run <<'SQL' || exit 1
insert into auth.users (id, email, raw_user_meta_data)
values ('00000000-0000-4000-b000-000000000001', 'simultaneous@reserba.test',
        '{"full_name": "Simultaneous Test", "consent": "true"}')
on conflict do nothing;
update public.users set residency_status = 'verified', resident_type = 'homeowner'
where user_id = '00000000-0000-4000-b000-000000000001';
insert into public.amenities (name, type, open_time, close_time, buffer_minutes)
select 'Simultaneous Court A', 'court', '06:00', '22:00', 0
where not exists (select 1 from public.amenities where name = 'Simultaneous Court A');
insert into public.amenities (name, type, open_time, close_time, buffer_minutes)
select 'Simultaneous Court B', 'court', '06:00', '22:00', 0
where not exists (select 1 from public.amenities where name = 'Simultaneous Court B');
insert into public.equipment (name, total_quantity)
select 'Simultaneous chairs', 15
where not exists (select 1 from public.equipment where name = 'Simultaneous chairs');
SQL

# A day far enough ahead that it is free; a new day on each run.
DAY=$(run -c "select (now() at time zone 'Asia/Manila')::date + 60 + (extract(epoch from now())::int % 300)")
A=$(run -c "select amenity_id from public.amenities where name = 'Simultaneous Court A'")
B=$(run -c "select amenity_id from public.amenities where name = 'Simultaneous Court B'")
CHAIRS=$(run -c "select equipment_id from public.equipment where name = 'Simultaneous chairs'")
WHO="'00000000-0000-4000-b000-000000000001'"
SLOT="'$DAY 08:00+08', '$DAY 10:00+08'"

# Saves inside a transaction that stays open for two seconds, so the other
# connection has to wait for it and then decide.
attempt() {
  if psql "$DB" -X -q -v ON_ERROR_STOP=1 -c "begin; $1; select pg_sleep(2); commit;" >/dev/null 2>&1; then
    echo accepted
  else
    echo rejected
  fi
}

count() { grep -c "$1" | tr -d ' '; }

# T23: the same free slot, twice, at the same moment.
BOOK="insert into public.reservations (amenity_id, user_id, created_by, start_at, end_at) values ($A, $WHO, $WHO, $SLOT)"
RESULTS=$( (attempt "$BOOK" & attempt "$BOOK" & wait) )
if [ "$(echo "$RESULTS" | count accepted)" = 1 ] && [ "$(echo "$RESULTS" | count rejected)" = 1 ]; then
  echo "T23 PASS: one accepted, one rejected"
else
  echo "T23 FAIL: $(echo $RESULTS)"
fi

# T30: two bookings at the same time on different courts, each asking for 10
# of the 15 chairs at the same moment.
run -c "insert into public.reservations (amenity_id, user_id, created_by, start_at, end_at) values ($A, $WHO, $WHO, '$DAY 14:00+08', '$DAY 16:00+08'), ($B, $WHO, $WHO, '$DAY 14:00+08', '$DAY 16:00+08')"
R1=$(run -c "select reservation_id from public.reservations where amenity_id = $A and start_at = '$DAY 14:00+08'")
R2=$(run -c "select reservation_id from public.reservations where amenity_id = $B and start_at = '$DAY 14:00+08'")
RESULTS=$( (attempt "insert into public.reservation_equipment (reservation_id, equipment_id, quantity) values ($R1, $CHAIRS, 10)" &
            attempt "insert into public.reservation_equipment (reservation_id, equipment_id, quantity) values ($R2, $CHAIRS, 10)" & wait) )
if [ "$(echo "$RESULTS" | count accepted)" = 1 ] && [ "$(echo "$RESULTS" | count rejected)" = 1 ]; then
  echo "T30 PASS: one accepted, one rejected"
else
  echo "T30 FAIL: $(echo $RESULTS)"
fi
