-- Type zaak: bar (horeca) of salon (kapper) — beïnvloedt dashboard-thema en gast-flow-keuze.

alter table public.bars
  add column if not exists venue_type text not null default 'horeca';

alter table public.bars
  drop constraint if exists bars_venue_type_check;

alter table public.bars
  add constraint bars_venue_type_check
  check (venue_type in ('horeca', 'kapper'));

comment on column public.bars.venue_type is 'horeca = bar-dashboard donker; kapper = salon-dashboard licht + gast-flow salon.';
