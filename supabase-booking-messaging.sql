-- African Wise Warrior Safaris
-- Booking Messaging / Reply Workflow
-- Run AFTER supabase-booking-approval.sql

begin;

create table if not exists public.booking_messages (
  id          text primary key,
  booking_id  text not null references public.bookings(id) on delete cascade,
  sender_id   uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('admin', 'user')),
  message     text not null check (length(trim(message)) between 1 and 5000),
  created_at  timestamptz not null default now()
);

create index if not exists booking_messages_booking_id_idx
  on public.booking_messages (booking_id, created_at);

alter table public.booking_messages enable row level security;

drop policy if exists "Users read own booking messages"
  on public.booking_messages;

drop policy if exists "Admins read booking messages"
  on public.booking_messages;

drop policy if exists "Users send own booking messages"
  on public.booking_messages;

drop policy if exists "Admins send approved booking messages"
  on public.booking_messages;

create policy "Users read own booking messages"
on public.booking_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.bookings b
    where b.id = booking_messages.booking_id
      and b.user_id = auth.uid()
  )
);

create policy "Admins read booking messages"
on public.booking_messages
for select
to authenticated
using (
  public.is_admin()
);

create policy "Users send own booking messages"
on public.booking_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and sender_role = 'user'
  and exists (
    select 1
    from public.bookings b
    where b.id = booking_messages.booking_id
      and b.user_id = auth.uid()
  )
);

create policy "Admins send approved booking messages"
on public.booking_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and sender_role = 'admin'
  and public.is_admin()
  and exists (
    select 1
    from public.bookings b
    where b.id = booking_messages.booking_id
      and b.status = 'approved'
  )
);

commit;
