-- African Wise Warrior Safaris
-- Booking Approval Workflow
-- Run this in Supabase SQL Editor AFTER reviewing it.

begin;

-- Allow the production booking workflow states.
-- Keep legacy 'reviewed' temporarily so existing rows are not invalidated.
do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'bookings_status_check'
      and conrelid = 'public.bookings'::regclass
  ) then
    alter table public.bookings
      drop constraint bookings_status_check;
  end if;
end $$;

alter table public.bookings
  add constraint bookings_status_check
  check (status in ('pending', 'approved', 'rejected', 'reviewed'));

-- Existing RLS already restricts booking updates to admins:
--   using (public.is_admin())
--   with check (public.is_admin())
--
-- No client-side role check is treated as the security boundary.

commit;
