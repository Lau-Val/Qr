-- BarBoost: bars, deals, QR-codes, gast-events (analytics), reviews.

create extension if not exists "pgcrypto";

create table if not exists public.bars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  bar_id uuid not null references public.bars (id) on delete cascade,
  external_key text not null,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  category text not null,
  tag text not null default '',
  urgency_text text not null default '',
  claim_code text not null,
  popularity_count int not null default 0,
  timer_seconds int not null default 1200,
  revenue_impact_estimate int not null default 0,
  conversion_percent int,
  insight_label text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (bar_id, external_key)
);

create index if not exists deals_bar_id_idx on public.deals (bar_id);

create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  bar_id uuid not null references public.bars (id) on delete cascade,
  slug text not null unique,
  label text,
  created_at timestamptz not null default now()
);

create index if not exists qr_codes_bar_id_idx on public.qr_codes (bar_id);

do $$ begin
  create type public.guest_event_type as enum (
    'scan',
    'claim',
    'upgrade',
    'comeback',
    'whatsapp_opt_in',
    'feedback',
    'review'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.guest_events (
  id uuid primary key default gen_random_uuid(),
  bar_id uuid not null references public.bars (id) on delete cascade,
  qr_code_id uuid references public.qr_codes (id) on delete set null,
  deal_id uuid references public.deals (id) on delete set null,
  event_type public.guest_event_type not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists guest_events_bar_time_idx on public.guest_events (bar_id, created_at desc);
create index if not exists guest_events_bar_type_idx on public.guest_events (bar_id, event_type);

create table if not exists public.bar_reviews (
  id uuid primary key default gen_random_uuid(),
  bar_id uuid not null references public.bars (id) on delete cascade,
  author text not null,
  text text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  review_date date not null default (now() at time zone 'utc')::date,
  created_at timestamptz not null default now()
);

create index if not exists bar_reviews_bar_id_idx on public.bar_reviews (bar_id);

alter table public.bars enable row level security;
alter table public.deals enable row level security;
alter table public.qr_codes enable row level security;
alter table public.guest_events enable row level security;
alter table public.bar_reviews enable row level security;
