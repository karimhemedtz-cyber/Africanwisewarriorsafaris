-- ============================================================
-- PHASE 1 — ADMIN MEDIA STORAGE
-- African Wise Warrior Safaris
-- ============================================================

-- Public bucket because uploaded images are public website assets.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'site-media',
  'site-media',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

-- Anyone can READ public website images.
drop policy if exists "Public read site media" on storage.objects;

create policy "Public read site media"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'site-media'
);

-- Only administrators can upload.
drop policy if exists "Admins upload site media" on storage.objects;

create policy "Admins upload site media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and public.is_admin()
);

-- Only administrators can replace/update uploaded media.
drop policy if exists "Admins update site media" on storage.objects;

create policy "Admins update site media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-media'
  and public.is_admin()
)
with check (
  bucket_id = 'site-media'
  and public.is_admin()
);

-- Only administrators can delete uploaded media.
drop policy if exists "Admins delete site media" on storage.objects;

create policy "Admins delete site media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-media'
  and public.is_admin()
);
