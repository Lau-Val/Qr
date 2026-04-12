-- Platform-beheerders (naast SUPER_ADMIN_EMAILS in env): persistente admin-accounts.
-- Alleen service role voegt rijen toe (server actions); gebruikers mogen eigen rij lezen (middleware / API).

create table if not exists public.platform_admins (
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  primary key (user_id)
);

create index if not exists platform_admins_created_by_idx
  on public.platform_admins (created_by);

alter table public.platform_admins enable row level security;

create policy "platform_admins_select_own"
  on public.platform_admins
  for select
  to authenticated
  using (auth.uid() = user_id);

comment on table public.platform_admins is
  'Wie platform-/admin-dashboard mag (naast bootstrap via SUPER_ADMIN_EMAILS).';
