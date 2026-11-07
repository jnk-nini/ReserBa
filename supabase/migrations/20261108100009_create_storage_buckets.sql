-- Private file storage for proof of residency and proof of payment.
-- Both buckets are private: a file can only be opened through a signed link that
-- expires (about 5 minutes), created by the app for someone allowed to see it.
-- The database stores the file path, not a link.
-- See docs/database-schema.md, section 5.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('residency-proofs', 'residency-proofs', false, 5242880,
   array['image/jpeg', 'image/png', 'application/pdf']),
  ('payment-proofs', 'payment-proofs', false, 5242880,
   array['image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do nothing;

-- A resident uploads into a folder named with their own user id,
-- for example  <user id>/proof.jpg.
create policy "proofs: resident uploads into own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('residency-proofs', 'payment-proofs')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- The owner and administrators can open the file. Files are never edited or
-- deleted by users; a new upload is a new file.
create policy "proofs: owner and admin read"
  on storage.objects for select to authenticated
  using (
    bucket_id in ('residency-proofs', 'payment-proofs')
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select public.is_admin())
    )
  );
