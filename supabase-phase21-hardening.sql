-- Phase 2.1 Supabase Security Hardening

create or replace function public.is_email_verified()
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1
    from auth.users
    where id = auth.uid()
      and email_confirmed_at is not null
  );
$$;

revoke all on function public.is_email_verified() from public;
grant execute on function public.is_email_verified() to authenticated;

drop policy if exists "Users insert own comments" on public.comments;

create policy "Verified users insert own comments"
on public.comments
for insert to authenticated
with check (
  user_id = auth.uid()
  and public.is_email_verified()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'packages_price_nonnegative'
      and conrelid = 'public.packages'::regclass
  ) then
    alter table public.packages
      add constraint packages_price_nonnegative
      check (price >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'packages_days_positive'
      and conrelid = 'public.packages'::regclass
  ) then
    alter table public.packages
      add constraint packages_days_positive
      check (days > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'packages_name_not_blank'
      and conrelid = 'public.packages'::regclass
  ) then
    alter table public.packages
      add constraint packages_name_not_blank
      check (length(trim(name)) between 1 and 200);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'packages_route_not_blank'
      and conrelid = 'public.packages'::regclass
  ) then
    alter table public.packages
      add constraint packages_route_not_blank
      check (length(trim(route)) between 1 and 500);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'packages_description_not_blank'
      and conrelid = 'public.packages'::regclass
  ) then
    alter table public.packages
      add constraint packages_description_not_blank
      check (length(trim(description)) between 1 and 5000);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'packages_id_reasonable_length'
      and conrelid = 'public.packages'::regclass
  ) then
    alter table public.packages
      add constraint packages_id_reasonable_length
      check (length(id) between 1 and 128);
  end if;
end $$;
