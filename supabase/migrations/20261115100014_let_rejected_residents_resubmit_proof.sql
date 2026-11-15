-- A rejected resident can upload a better proof of residency, but nothing put
-- the account back in the administrator's list: the status stayed "rejected"
-- and a resident is not allowed to change their own status.
--
-- Now the database does it: when a rejected resident saves a new proof file,
-- the status returns to "pending" and the old rejection note is cleared. The
-- resident still cannot set the status themselves.
--
-- The audit trigger on users only fired when the screen itself changed the
-- role, status, or type. It is replaced by one that looks at the saved values,
-- so the automatic return to "pending" is logged too.

create or replace function public.users_protect_columns()
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

    -- A new proof from a rejected resident asks for another look.
    if old.residency_status = 'rejected'
       and new.proof_of_residency_url is not null
       and new.proof_of_residency_url is distinct from old.proof_of_residency_url then
      new.residency_status := 'pending';
      new.residency_note := null;
    end if;
  elsif new.role is distinct from old.role and old.user_id = (select auth.uid()) then
    raise exception 'An administrator cannot change their own role.';
  end if;

  return new;
end;
$$;

drop trigger audit_users on public.users;

create trigger audit_users
  after update on public.users
  for each row
  when (
    old.role is distinct from new.role
    or old.residency_status is distinct from new.residency_status
    or old.resident_type is distinct from new.resident_type
  )
  execute function public.write_audit_log('user_id');
