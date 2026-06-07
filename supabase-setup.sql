-- ============================================================
-- African Wase Warrior Safaris — Supabase Database Setup
-- Run this entire script in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. PACKAGES
create table if not exists packages (
  id          text primary key,
  name        text        not null,
  price       numeric     not null default 0,
  route       text        not null default '',
  days        integer     not null default 1,
  description text        not null default '',
  image_url   text        not null default '',
  created_at  timestamptz not null default now()
);

-- 2. BOOKINGS
create table if not exists bookings (
  id           text primary key,
  name         text        not null,
  email        text        not null,
  package_id   text        not null default '',
  package_name text        not null default '',
  people       integer     not null default 1,
  message      text        not null default '',
  status       text        not null default 'pending',
  created_at   timestamptz not null default now()
);

-- 3. NEWS
create table if not exists news (
  id         text primary key,
  title      text        not null,
  content    text        not null,
  image_url  text        not null default '',
  created_at timestamptz not null default now()
);

-- 4. COMMENTS
create table if not exists comments (
  id         text primary key,
  user_id    text        not null,
  username   text        not null,
  comment    text        not null,
  created_at timestamptz not null default now()
);

-- 5. SITE SETTINGS (single row, stores all editable content as JSON)
create table if not exists site_settings (
  id       text primary key,
  settings jsonb not null default '{}'::jsonb
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table packages     enable row level security;
alter table bookings     enable row level security;
alter table news         enable row level security;
alter table comments     enable row level security;
alter table site_settings enable row level security;

-- Public read
create policy "Public read packages"      on packages      for select using (true);
create policy "Public read news"          on news          for select using (true);
create policy "Public read comments"      on comments      for select using (true);
create policy "Public read site_settings" on site_settings for select using (true);

-- Authenticated users can insert bookings and comments
create policy "Auth insert bookings"  on bookings  for insert with check (auth.role() = 'authenticated');
create policy "Auth insert comments"  on comments  for insert with check (auth.role() = 'authenticated');

-- Service role (admin) has full access to everything
create policy "Service full packages"      on packages      using (auth.role() = 'service_role');
create policy "Service full bookings"      on bookings      using (auth.role() = 'service_role');
create policy "Service full news"          on news          using (auth.role() = 'service_role');
create policy "Service full comments"      on comments      using (auth.role() = 'service_role');
create policy "Service full site_settings" on site_settings using (auth.role() = 'service_role');

-- ============================================================
-- SEED SAMPLE DATA
-- ============================================================

insert into packages (id, name, price, route, days, description, image_url) values
  ('serengeti_5day',
   'Serengeti Great Migration', 2800,
   'Arusha → Tarangire → Serengeti → Ngorongoro → Arusha', 5,
   'Follow the greatest wildlife show on Earth. Witness 1.5 million wildebeest crossing the Mara River on this all-inclusive luxury expedition.',
   '/src/assets/images/package_serengeti_1779964123153.png'),
  ('masai_mara_adventure',
   'Maasai Mara Luxury Adventure', 3200,
   'Nairobi → Great Rift Valley → Maasai Mara → Nairobi', 7,
   'Watch black-maned lions patrol their pride, observe cheetahs chasing prey, and visit a traditional Maasai warrior village.',
   '/src/assets/images/package_masaimara_1779964145785.png'),
  ('ngorongoro_crater',
   'Ngorongoro Crater Experience', 1900,
   'Arusha → Ngorongoro Crater → Lake Manyara → Arusha', 3,
   'Descend into the world''s largest intact volcanic caldera sheltering over 25,000 large mammals including the endangered black rhino.',
   '/src/assets/images/package_ngorongoro_1779964167185.png')
on conflict (id) do nothing;

insert into news (id, title, content, image_url) values
  ('news_1',
   'The Great Wildebeest Migration Reaches the Mara River',
   'Our scouts report that massive herds of wildebeests are piling up along the southern banks of the Mara River. The dangerous annual crossings have begun earlier than expected this season!',
   '/src/assets/images/package_serengeti_1779964123153.png'),
  ('news_2',
   'Wase Warrior Conservation Program Receives Excellence Award',
   'We are proud to announce that the African Wase Warrior Safaris foundation has received the East African Conservation Vanguard Trophy.',
   '/src/assets/images/safari_hero_1779964102826.png')
on conflict (id) do nothing;

-- ============================================================
-- DONE — your database is ready!
-- Next: add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
-- to Netlify environment variables and deploy.
-- ============================================================
