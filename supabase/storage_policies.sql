-- Allow authenticated users to upload their own avatars
create policy "Allow authenticated users to upload avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars' AND
  (auth.uid())::text = substring(name from '^[^-]+')
);

-- Allow public access to view avatars
create policy "Allow public to view avatars"
on storage.objects for select
to public
using ( bucket_id = 'avatars' );

-- Allow users to update their own avatars
create policy "Allow users to update their own avatars"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars' AND
  (auth.uid())::text = substring(name from '^[^-]+')
);

-- Allow users to delete their own avatars
create policy "Allow users to delete their own avatars"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars' AND
  (auth.uid())::text = substring(name from '^[^-]+')
); 