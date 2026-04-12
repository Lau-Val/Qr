-- Koppeling Supabase Auth users ↔ bars (eigenaar / personeel).
-- Platform-beheer maakt users + bars aan via service role (buiten deze policies om).

create table if not exists public.bar_members (
  user_id uuid not null references auth.users (id) on delete cascade,
  bar_id uuid not null references public.bars (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  primary key (user_id, bar_id)
);

create index if not exists bar_members_bar_id_idx on public.bar_members (bar_id);
create index if not exists bar_members_user_id_idx on public.bar_members (user_id);

alter table public.bar_members enable row level security;

create policy "bar_members_select_own"
  on public.bar_members
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Eigenaar mag eigen zaak-rij lezen (o.a. voor slug in client/server met user-JWT)
create policy "bars_select_if_member"
  on public.bars
  for select
  to authenticated
  using (
    exists (
      select 1 from public.bar_members m
      where m.bar_id = bars.id and m.user_id = auth.uid()
    )
  );

comment on table public.bar_members is 'Welke gebruiker toegang heeft tot welke bar (dashboard).';
