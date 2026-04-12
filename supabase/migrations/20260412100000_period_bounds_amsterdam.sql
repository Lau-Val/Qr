-- Betrouwbare periode-grenzen in Europe/Amsterdam voor dashboard-queries (DST-proof).

create or replace function public.period_bounds_amsterdam(p_kind text)
returns table(period_start timestamptz, period_end timestamptz)
language sql
stable
as $$
  with ref as (
    select now() as ts
  ),
  today_bounds as (
    select
      (date_trunc('day', ref.ts at time zone 'Europe/Amsterdam') at time zone 'Europe/Amsterdam') as s,
      ((date_trunc('day', ref.ts at time zone 'Europe/Amsterdam') + interval '1 day') at time zone 'Europe/Amsterdam') as e
    from ref
  ),
  week_bounds as (
    select
      (date_trunc('week', ref.ts at time zone 'Europe/Amsterdam') at time zone 'Europe/Amsterdam') as s,
      ((date_trunc('week', ref.ts at time zone 'Europe/Amsterdam') + interval '7 days') at time zone 'Europe/Amsterdam') as e
    from ref
  ),
  month_bounds as (
    select
      (date_trunc('month', ref.ts at time zone 'Europe/Amsterdam') at time zone 'Europe/Amsterdam') as s,
      ((date_trunc('month', ref.ts at time zone 'Europe/Amsterdam') + interval '1 month') at time zone 'Europe/Amsterdam') as e
    from ref
  )
  select * from (
    select t.s, t.e from today_bounds t where p_kind = 'today'
    union all
    select w.s, w.e from week_bounds w where p_kind = 'week'
    union all
    select m.s, m.e from month_bounds m where p_kind = 'month'
  ) x
  limit 1;
$$;

comment on function public.period_bounds_amsterdam(text) is 'Start/einde (timestamptz) voor today|week|month in Europe/Amsterdam. Week = ISO-week (maandag).';
