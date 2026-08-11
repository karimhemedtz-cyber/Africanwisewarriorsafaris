-- ============================================================
-- African Wise Warrior Safaris — Production Supabase Setup
-- Supabase Auth + PostgreSQL + RLS
-- ============================================================

create extension if not exists pgcrypto;

-- 1. USER PROFILES / ROLES
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role         text not null default 'user' check (role in ('user', 'admin')),
  created_at   timestamptz not null default now()
);

-- Create a profile automatically whenever a Supabase Auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'user'
  )
  on conflict (id) do update
    set display_name = excluded.display_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Helper used by RLS. SECURITY DEFINER avoids recursive profile policies.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 2. PACKAGES
create table if not exists public.packages (
  id          text primary key,
  name        text not null,
  price       numeric not null default 0,
  route       text not null default '',
  days        integer not null default 1,
  description text not null default '',
  image_url   text not null default '',
  created_at  timestamptz not null default now()
);

-- 3. BOOKINGS
create table if not exists public.bookings (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete set null,
  name         text not null,
  email        text not null,
  package_id   text not null default '',
  package_name text not null default '',
  people       integer not null default 1 check (people > 0),
  message      text not null default '',
  status       text not null default 'pending' check (status in ('pending', 'reviewed')),
  created_at   timestamptz not null default now()
);

-- Safely add user_id if this database was created using the older schema.
alter table public.bookings add column if not exists user_id uuid references auth.users(id) on delete set null;

-- 4. NEWS
create table if not exists public.news (
  id         text primary key,
  title      text not null,
  content    text not null,
  image_url  text not null default '',
  created_at timestamptz not null default now()
);

-- 5. COMMENTS
create table if not exists public.comments (
  id         text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  username   text not null,
  comment    text not null check (length(trim(comment)) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- 6. SITE SETTINGS
create table if not exists public.site_settings (
  id       text primary key,
  settings jsonb not null default '{}'::jsonb
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.packages enable row level security;
alter table public.bookings enable row level security;
alter table public.news enable row level security;
alter table public.comments enable row level security;
alter table public.site_settings enable row level security;

-- Remove old policies if this script is being re-run.
drop policy if exists "Public read packages" on public.packages;
drop policy if exists "Public read news" on public.news;
drop policy if exists "Public read comments" on public.comments;
drop policy if exists "Public read site_settings" on public.site_settings;
drop policy if exists "Auth insert bookings" on public.bookings;
drop policy if exists "Auth insert comments" on public.comments;
drop policy if exists "Service full packages" on public.packages;
drop policy if exists "Service full bookings" on public.bookings;
drop policy if exists "Service full news" on public.news;
drop policy if exists "Service full comments" on public.comments;
drop policy if exists "Service full site_settings" on public.site_settings;

-- Profiles: users can read their own profile; admins can read profiles.
create policy "Users read own profile"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

-- Public catalogue/content reads.
create policy "Public read packages" on public.packages
for select to anon, authenticated using (true);

create policy "Public read news" on public.news
for select to anon, authenticated using (true);

create policy "Public read comments" on public.comments
for select to anon, authenticated using (true);

create policy "Public read site_settings" on public.site_settings
for select to anon, authenticated using (true);

-- Bookings: signed-in users create their own booking and read only their own bookings.
create policy "Users insert own bookings" on public.bookings
for insert to authenticated
with check (user_id = auth.uid());

create policy "Users read own bookings" on public.bookings
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Admins update bookings" on public.bookings
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins delete bookings" on public.bookings
for delete to authenticated
using (public.is_admin());

-- Comments: verified/authenticated users can insert their own comment; admins can delete.
create policy "Users insert own comments" on public.comments
for insert to authenticated
with check (user_id = auth.uid());

create policy "Admins delete comments" on public.comments
for delete to authenticated
using (public.is_admin());

-- Admin-only content management.
create policy "Admins insert packages" on public.packages
for insert to authenticated with check (public.is_admin());
create policy "Admins update packages" on public.packages
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete packages" on public.packages
for delete to authenticated using (public.is_admin());

create policy "Admins insert news" on public.news
for insert to authenticated with check (public.is_admin());
create policy "Admins update news" on public.news
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete news" on public.news
for delete to authenticated using (public.is_admin());

create policy "Admins insert settings" on public.site_settings
for insert to authenticated with check (public.is_admin());
create policy "Admins update settings" on public.site_settings
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete settings" on public.site_settings
for delete to authenticated using (public.is_admin());

-- ============================================================
-- SAMPLE DATA
-- ============================================================

insert into public.packages (id, name, price, route, days, description, image_url) values
  ('serengeti_5day', 'Serengeti Great Migration', 2800,
   'Arusha → Tarangire → Serengeti → Ngorongoro → Arusha', 5,
   'Follow the greatest wildlife show on Earth. Witness 1.5 million wildebeest crossing the Mara River on this all-inclusive luxury expedition.',
   '/images/package_serengeti_1779964123153.png'),
  ('masai_mara_adventure', 'Maasai Mara Luxury Adventure', 3200,
   'Nairobi → Great Rift Valley → Maasai Mara → Nairobi', 7,
   'Watch black-maned lions patrol their pride, observe cheetahs chasing prey, and visit a traditional Maasai warrior village.',
   '/images/package_masaimara_1779964145785.png'),
  ('ngorongoro_crater', 'Ngorongoro Crater Experience', 1900,
   'Arusha → Ngorongoro Crater → Lake Manyara → Arusha', 3,
   'Descend into the world''s largest intact volcanic caldera sheltering over 25,000 large mammals including the endangered black rhino.',
   '/images/package_ngorongoro_1779964167185.png')
on conflict (id) do nothing;

insert into public.news (id, title, content, image_url) values
  ('news_1', 'The Great Wildebeest Migration Reaches the Mara River',
   'Our scouts report that massive herds of wildebeests are piling up along the southern banks of the Mara River. The dangerous annual crossings have begun earlier than expected this season!',
   '/images/package_serengeti_1779964123153.png'),
  ('news_2', 'Wase Warrior Conservation Program Receives Excellence Award',
   'We are proud to announce that the African Wase Warrior Safaris foundation has received the East African Conservation Vanguard Trophy.',
   '/images/safari_hero_1779964102826.png')
on conflict (id) do nothing;

insert into public.site_settings (id, settings)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

-- Backfill profiles for Auth users that existed before this migration.
insert into public.profiles (id, display_name, role)
select
  id,
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  'user'
from auth.users
on conflict (id) do nothing;

-- ============================================================
-- ADMIN SETUP
-- ============================================================
-- 1. In Supabase Dashboard → Authentication → Users, create the owner:
--      Email:    karimuhemedi@yahoo.com
--    Keep this password OUT of source code and environment files.
--
-- 2. After the Auth user exists, promote the owner in SQL Editor:
--
-- update public.profiles
-- set role = 'admin', display_name = 'Karimu Hemedi'
-- where id = (select id from auth.users where lower(email) = 'karimuhemedi@yahoo.com');
--
-- Verify:
-- select p.id, u.email, p.role from public.profiles p
-- join auth.users u on u.id = p.id
-- where lower(u.email) = 'karimuhemedi@yahoo.com';
--
-- ============================================================
-- END
-- ============================================================
