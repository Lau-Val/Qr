-- WhatsApp Business (Embedded Signup + Cloud API) per zaak (company_id = bars.id).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helper: maintain updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_whatsapp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- A. whatsapp_connections
-- ---------------------------------------------------------------------------
create table if not exists public.whatsapp_connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.bars (id) on delete cascade,
  waba_id text,
  phone_number_id text,
  business_phone_number text,
  business_name text,
  status text not null default 'not_connected'
    check (status in ('not_connected', 'connecting', 'connected', 'error', 'disconnected')),
  -- Prefer Vault/KMS ref in production; never store raw tokens in plaintext columns.
  access_token_vault_ref text,
  -- Optional: AES-256-GCM ciphertext (server-only decrypt via WHATSAPP_TOKEN_ENCRYPTION_KEY).
  access_token_encrypted bytea,
  webhook_subscribed boolean not null default false,
  quality_rating text,
  meta_business_id text,
  meta_user_id text,
  graph_api_version text not null default 'v21.0',
  last_synced_at timestamptz,
  last_webhook_received_at timestamptz,
  connection_health text not null default 'unknown'
    check (connection_health in ('ok', 'degraded', 'unknown')),
  onboarding_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id),
  unique (waba_id),
  unique (phone_number_id)
);

create index if not exists whatsapp_connections_company_id_idx
  on public.whatsapp_connections (company_id);

comment on table public.whatsapp_connections is 'Per-tenant WhatsApp Business Account link (Embedded Signup). company_id = bars.id.';
comment on column public.whatsapp_connections.access_token_vault_ref is 'Opaque reference to encrypted token in Vault/KMS — not the token itself.';

drop trigger if exists whatsapp_connections_set_updated_at on public.whatsapp_connections;
create trigger whatsapp_connections_set_updated_at
  before update on public.whatsapp_connections
  for each row execute function public.set_whatsapp_updated_at();

-- ---------------------------------------------------------------------------
-- B. whatsapp_templates
-- ---------------------------------------------------------------------------
create table if not exists public.whatsapp_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.bars (id) on delete cascade,
  template_name text not null,
  template_category text,
  language text not null default 'nl',
  status text not null default 'draft',
  components jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, template_name, language)
);

create index if not exists whatsapp_templates_company_id_idx
  on public.whatsapp_templates (company_id);

drop trigger if exists whatsapp_templates_set_updated_at on public.whatsapp_templates;
create trigger whatsapp_templates_set_updated_at
  before update on public.whatsapp_templates
  for each row execute function public.set_whatsapp_updated_at();

-- ---------------------------------------------------------------------------
-- C. whatsapp_campaigns
-- ---------------------------------------------------------------------------
create table if not exists public.whatsapp_campaigns (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.bars (id) on delete cascade,
  template_id uuid references public.whatsapp_templates (id) on delete set null,
  campaign_name text not null,
  body_variables jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'sending', 'completed', 'cancelled', 'failed')),
  scheduled_at timestamptz,
  sent_count int not null default 0,
  delivered_count int not null default 0,
  read_count int not null default 0,
  failed_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists whatsapp_campaigns_company_id_idx
  on public.whatsapp_campaigns (company_id);
create index if not exists whatsapp_campaigns_scheduled_at_idx
  on public.whatsapp_campaigns (scheduled_at);

drop trigger if exists whatsapp_campaigns_set_updated_at on public.whatsapp_campaigns;
create trigger whatsapp_campaigns_set_updated_at
  before update on public.whatsapp_campaigns
  for each row execute function public.set_whatsapp_updated_at();

-- ---------------------------------------------------------------------------
-- D. whatsapp_recipients
-- ---------------------------------------------------------------------------
create table if not exists public.whatsapp_recipients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.bars (id) on delete cascade,
  phone_number text not null,
  opt_in_status text not null default 'unknown'
    check (opt_in_status in ('unknown', 'opted_in', 'opted_out')),
  source text,
  first_seen_at timestamptz not null default now(),
  last_interaction_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, phone_number)
);

create index if not exists whatsapp_recipients_company_id_idx
  on public.whatsapp_recipients (company_id);

drop trigger if exists whatsapp_recipients_set_updated_at on public.whatsapp_recipients;
create trigger whatsapp_recipients_set_updated_at
  before update on public.whatsapp_recipients
  for each row execute function public.set_whatsapp_updated_at();

-- ---------------------------------------------------------------------------
-- E. whatsapp_messages
-- ---------------------------------------------------------------------------
create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.bars (id) on delete cascade,
  campaign_id uuid references public.whatsapp_campaigns (id) on delete set null,
  recipient_id uuid references public.whatsapp_recipients (id) on delete set null,
  phone_number text not null,
  external_message_id text,
  message_type text not null default 'outbound',
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'delivered', 'read', 'failed')),
  error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists whatsapp_messages_company_id_idx
  on public.whatsapp_messages (company_id);
create index if not exists whatsapp_messages_campaign_id_idx
  on public.whatsapp_messages (campaign_id);
create index if not exists whatsapp_messages_external_id_idx
  on public.whatsapp_messages (external_message_id);

drop trigger if exists whatsapp_messages_set_updated_at on public.whatsapp_messages;
create trigger whatsapp_messages_set_updated_at
  before update on public.whatsapp_messages
  for each row execute function public.set_whatsapp_updated_at();

-- ---------------------------------------------------------------------------
-- Audit log (bonus)
-- ---------------------------------------------------------------------------
create table if not exists public.whatsapp_connection_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.bars (id) on delete cascade,
  event_type text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists whatsapp_connection_events_company_created_idx
  on public.whatsapp_connection_events (company_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security: members of a bar may only see their company rows
-- ---------------------------------------------------------------------------
alter table public.whatsapp_connections enable row level security;
alter table public.whatsapp_templates enable row level security;
alter table public.whatsapp_campaigns enable row level security;
alter table public.whatsapp_recipients enable row level security;
alter table public.whatsapp_messages enable row level security;
alter table public.whatsapp_connection_events enable row level security;

create policy "whatsapp_connections_member_select"
  on public.whatsapp_connections for select to authenticated
  using (
    exists (
      select 1 from public.bar_members m
      where m.bar_id = whatsapp_connections.company_id and m.user_id = auth.uid()
    )
  );

create policy "whatsapp_connections_member_insert"
  on public.whatsapp_connections for insert to authenticated
  with check (
    exists (
      select 1 from public.bar_members m
      where m.bar_id = whatsapp_connections.company_id and m.user_id = auth.uid()
    )
  );

create policy "whatsapp_connections_member_update"
  on public.whatsapp_connections for update to authenticated
  using (
    exists (
      select 1 from public.bar_members m
      where m.bar_id = whatsapp_connections.company_id and m.user_id = auth.uid()
    )
  );

create policy "whatsapp_templates_member_all"
  on public.whatsapp_templates for all to authenticated
  using (
    exists (
      select 1 from public.bar_members m
      where m.bar_id = whatsapp_templates.company_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.bar_members m
      where m.bar_id = whatsapp_templates.company_id and m.user_id = auth.uid()
    )
  );

create policy "whatsapp_campaigns_member_all"
  on public.whatsapp_campaigns for all to authenticated
  using (
    exists (
      select 1 from public.bar_members m
      where m.bar_id = whatsapp_campaigns.company_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.bar_members m
      where m.bar_id = whatsapp_campaigns.company_id and m.user_id = auth.uid()
    )
  );

create policy "whatsapp_recipients_member_all"
  on public.whatsapp_recipients for all to authenticated
  using (
    exists (
      select 1 from public.bar_members m
      where m.bar_id = whatsapp_recipients.company_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.bar_members m
      where m.bar_id = whatsapp_recipients.company_id and m.user_id = auth.uid()
    )
  );

create policy "whatsapp_messages_member_all"
  on public.whatsapp_messages for all to authenticated
  using (
    exists (
      select 1 from public.bar_members m
      where m.bar_id = whatsapp_messages.company_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.bar_members m
      where m.bar_id = whatsapp_messages.company_id and m.user_id = auth.uid()
    )
  );

create policy "whatsapp_connection_events_member_select"
  on public.whatsapp_connection_events for select to authenticated
  using (
    company_id is null
    or exists (
      select 1 from public.bar_members m
      where m.bar_id = whatsapp_connection_events.company_id and m.user_id = auth.uid()
    )
  );

create policy "whatsapp_connection_events_member_insert"
  on public.whatsapp_connection_events for insert to authenticated
  with check (
    company_id is not null
    and exists (
      select 1 from public.bar_members m
      where m.bar_id = whatsapp_connection_events.company_id and m.user_id = auth.uid()
    )
  );

-- Service role (API routes / webhooks) bypasses RLS via SUPABASE_SERVICE_ROLE_KEY.
