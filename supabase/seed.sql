-- Sample data for trying the system (task T43): three amenities with rates and
-- some equipment. The rates are placeholders; each association sets its own
-- from the Amenities screen.
--
-- Run it once in the Supabase SQL editor of a development project. It adds
-- nothing if amenities or equipment already exist.
-- Accounts are not created here: people sign up through the app, and the first
-- administrator is set by hand (see README, "First administrator").

insert into public.amenities
  (name, type, open_time, close_time, buffer_minutes, rate_resident, rate_nonresident, deposit)
select * from (values
  ('Clubhouse',        'clubhouse', '08:00'::time, '22:00'::time, 60, 500, 800, 1000),
  ('Basketball Court', 'court',     '06:00'::time, '22:00'::time,  0, 100, 150,    0),
  ('Swimming Pool',    'pool',      '08:00'::time, '20:00'::time, 30, 300, 450,  500)
) as sample
where not exists (select 1 from public.amenities);

insert into public.equipment (name, total_quantity, rate, condition)
select * from (values
  ('Monobloc chairs', 100,   5, 'Good'),
  ('Folding tables',   20,  50, 'Good'),
  ('Sound system',      1, 500, 'Good')
) as sample
where not exists (select 1 from public.equipment);
