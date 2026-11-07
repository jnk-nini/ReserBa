-- Users: one row per person with an account (resident, administrator, or guard).
-- The login itself (email and password) stays in Supabase's own auth.users table.
-- See docs/database-schema.md, section 2.

-- Needed later by the "no overlapping reservations" rule.
create extension if not exists btree_gist with schema extensions;

create table public.users (
  user_id uuid primary key references auth.users (id),
  full_name text not null check (length(trim(full_name)) > 0),
  email text not null unique,
  contact_no text,
  address text,
  role text not null default 'resident'
    check (role in ('resident', 'admin', 'guard')),
  resident_type text
    check (resident_type in ('homeowner', 'tenant')),
  residency_status text not null default 'pending'
    check (residency_status in ('pending', 'verified', 'rejected')),
  consent_at timestamptz not null,
  proof_of_residency_url text,
  -- Why a resident was rejected (for example "proof photo is blurry"), written
  -- by the administrator. The resident can read it. Because it changes in the
  -- same update as the status, it also lands in the audit log.
  residency_note text,
  created_at timestamptz not null default now(),
  -- A verified resident must have been marked homeowner or tenant.
  constraint users_verified_needs_type
    check (role <> 'resident' or residency_status <> 'verified' or resident_type is not null)
);

-- Locked by default. The policies come in the row level security migration.
alter table public.users enable row level security;

-- Who is asking? These two helpers are used by almost every policy and trigger.
-- They are "security definer" so they can read users without being blocked by
-- the very policies that call them.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.users
    where user_id = (select auth.uid()) and role = 'admin'
  );
$$;

create function public.is_guard()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.users
    where user_id = (select auth.uid()) and role = 'guard'
  );
$$;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_guard() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_guard() to authenticated;

-- Sign-up: when Supabase creates a login, create the matching users row.
-- Everyone starts as a pending resident. The role is never taken from the form.
-- Sign-up is refused without privacy consent (RA 10173).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := trim(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
begin
  if coalesce(new.raw_user_meta_data ->> 'consent', '') <> 'true' then
    raise exception 'Sign-up needs the privacy consent.';
  end if;
  if v_name = '' then
    raise exception 'Sign-up needs a full name.';
  end if;

  insert into public.users (user_id, full_name, email, contact_no, address, consent_at)
  values (
    new.id,
    v_name,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'contact_no'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'address'), ''),
    now()
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Protect the sensitive columns. A resident can fix their name, contact,
-- address, and proof file, but cannot make themselves an administrator or
-- mark themselves verified. Only an administrator can, and not on their own role.
-- Changes made from the Supabase dashboard (no signed-in user) are allowed,
-- which is how the first administrator is created.
create function public.users_protect_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return new;
  end if;

  if not public.is_admin() then
    if (new.user_id, new.email, new.role, new.resident_type,
        new.residency_status, new.residency_note, new.consent_at, new.created_at)
       is distinct from
       (old.user_id, old.email, old.role, old.resident_type,
        old.residency_status, old.residency_note, old.consent_at, old.created_at) then
      raise exception 'Only an administrator can change a role, residency status, resident type, residency note, or email.';
    end if;
  elsif new.role is distinct from old.role and old.user_id = (select auth.uid()) then
    raise exception 'An administrator cannot change their own role.';
  end if;

  return new;
end;
$$;

revoke execute on function public.users_protect_columns() from public, anon, authenticated;

create trigger users_protect_columns
  before update on public.users
  for each row execute function public.users_protect_columns();
