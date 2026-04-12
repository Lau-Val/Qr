-- Demo-seed: Café Nova + deals + QR + events + reviews.
-- Na migraties: 20260412120000_init_barboost.sql en 20260412100000_period_bounds_amsterdam.sql

insert into public.bars (slug, name, settings)
values ('cafe-nova', 'Café Nova', '{}'::jsonb)
on conflict (slug) do nothing;

do $$
declare
  bid uuid;
  d1 uuid; d2 uuid; d3 uuid; d4 uuid; d5 uuid; d6 uuid; d7 uuid; d8 uuid; d0 uuid;
  qid uuid;
begin
  select id into bid from public.bars where slug = 'cafe-nova';
  if bid is null then
    raise exception 'Bar cafe-nova ontbreekt';
  end if;

  insert into public.deals (
    bar_id, external_key, title, subtitle, description, category, tag, urgency_text,
    claim_code, popularity_count, timer_seconds, revenue_impact_estimate,
    conversion_percent, insight_label, active, sort_order
  )
  values
    (bid, 'd1', '2 bier voor €6', 'Trek samen op', 'Alleen geldig bij aankoop van minimaal 1 ronde.', 'bier', 'Groepsfavoriet', 'Nog 12 keer geclaimd vanavond', 'BB-4821', 12, 598, 180, 36, 'Populair', true, 1),
    (bid, 'd2', '3 shots voor €10', 'Groepsprijs', 'Alleen geldig bij aankoop van minimaal 1 ronde.', 'shots', 'Groepsfavoriet', 'Trending bij groepen', 'BB-5912', 24, 598, 420, 42, 'Beste omzet', true, 2),
    (bid, 'd3', 'Gratis shot bij je volgende ronde', 'Loyaliteit beloond', 'Toon je voucher bij de volgende bestelling.', 'shots', 'Terugkerende gasten', 'Beperkt vanavond', 'BB-2201', 8, 598, 95, 28, 'Beste comeback deal', true, 3),
    (bid, 'd4', 'Cocktail upgrade voor +€2', 'Upgrade je avond', 'Kies een premium cocktail i.p.v. standaard.', 'cocktail', 'Upsell', 'Veel gekozen na 22:00', 'BB-7734', 15, 598, 260, 42, 'Beste upsell', true, 4),
    (bid, 'd5', 'Nachos + pitcher deal', 'Voor het hele tafeltje', 'Combinatie alleen vanavond geldig.', 'food', 'Food & drink', 'Nog 6 beschikbaar', 'BB-3390', 6, 598, 310, 31, 'Populair', true, 5),
    (bid, 'd6', '2 cocktails voor €10', 'Happy hour vibe', 'Geldig op geselecteerde cocktails.', 'cocktail', 'Vanavond actief', 'Alleen in deze bar', 'BB-8844', 19, 598, 380, 42, 'Sterk deze week', true, 6),
    (bid, 'd7', 'Bitterballen + bier deal', 'Hollands genieten', 'Portie bitterballen + huisbier.', 'food', 'Snack', 'Populair voor 21:00', 'BB-1029', 11, 598, 145, 29, 'Populair', true, 7),
    (bid, 'd8', 'Vrienden deal: 4 shotjes groepsprijs', 'Minimaal 4 personen', 'Laat je groep zien aan de bar.', 'groep', 'Groep', 'Perfect voor vrijdag/zaterdag', 'BB-6610', 17, 598, 290, 35, 'Populair', true, 8),
    (bid, 'd0', 'Probeer opnieuw', 'Nog een kans', 'Draai of tap nog een keer voor een andere deal.', 'retry', 'Opnieuw', 'Oneindige pogingen (demo)', 'BB-0000', 0, 598, 0, 0, null, true, 99)
  on conflict (bar_id, external_key) do nothing;

  select id into d1 from public.deals where bar_id = bid and external_key = 'd1';
  select id into d2 from public.deals where bar_id = bid and external_key = 'd2';
  select id into d3 from public.deals where bar_id = bid and external_key = 'd3';
  select id into d4 from public.deals where bar_id = bid and external_key = 'd4';
  select id into d5 from public.deals where bar_id = bid and external_key = 'd5';
  select id into d6 from public.deals where bar_id = bid and external_key = 'd6';
  select id into d7 from public.deals where bar_id = bid and external_key = 'd7';
  select id into d8 from public.deals where bar_id = bid and external_key = 'd8';

  insert into public.qr_codes (bar_id, slug, label)
  values (bid, 'tafel-a1', 'Tafel A1')
  on conflict (slug) do nothing;

  select id into qid from public.qr_codes where slug = 'tafel-a1';

  if not exists (select 1 from public.guest_events where bar_id = bid limit 1) then
    for i in 1..520 loop
      insert into public.guest_events (bar_id, qr_code_id, deal_id, event_type, metadata, created_at)
      values (
        bid,
        qid,
        (array [d1, d2, d3, d4, d5, d6, d7, d8]) [1 + (i % 8)],
        (
          case (i % 20)
            when 0 then 'claim'::public.guest_event_type
            when 1 then 'upgrade'::public.guest_event_type
            when 2 then 'comeback'::public.guest_event_type
            when 3 then 'whatsapp_opt_in'::public.guest_event_type
            when 4 then 'feedback'::public.guest_event_type
            when 5 then 'review'::public.guest_event_type
            else 'scan'::public.guest_event_type
          end
        ),
        jsonb_build_object(
          'session_id', gen_random_uuid()::text,
          'claim_tier',
          case
            when (i % 20) = 0 and random() < 0.42 then 'upgraded'
            when (i % 20) = 0 then 'base'
            else null
          end
        ),
        now() - (random() * interval '35 days')
      );
    end loop;

    insert into public.guest_events (bar_id, qr_code_id, deal_id, event_type, metadata, created_at)
    values
      (bid, qid, d6, 'scan', jsonb_build_object('session_id', gen_random_uuid()::text), now() - interval '40 minutes'),
      (bid, qid, d6, 'scan', jsonb_build_object('session_id', gen_random_uuid()::text), now() - interval '25 minutes'),
      (bid, qid, d6, 'scan', jsonb_build_object('session_id', gen_random_uuid()::text), now() - interval '12 minutes'),
      (bid, qid, d6, 'scan', jsonb_build_object('session_id', gen_random_uuid()::text), now() - interval '5 minutes'),
      (bid, qid, d6, 'claim', jsonb_build_object('session_id', gen_random_uuid()::text, 'claim_tier', 'base'), now() - interval '18 minutes'),
      (bid, qid, d6, 'claim', jsonb_build_object('session_id', gen_random_uuid()::text, 'claim_tier', 'upgraded'), now() - interval '8 minutes'),
      (bid, qid, d6, 'upgrade', jsonb_build_object('session_id', gen_random_uuid()::text), now() - interval '22 minutes'),
      (bid, qid, d6, 'scan', jsonb_build_object('session_id', gen_random_uuid()::text), now() - interval '50 minutes');
  end if;

  if not exists (select 1 from public.bar_reviews where bar_id = bid limit 1) then
    insert into public.bar_reviews (bar_id, author, text, rating, review_date)
    values
      (bid, 'Lisa', 'Super sfeer en de cocktaildeal was echt top.', 5, current_date - 2),
      (bid, 'Tom', 'Vriendelijke bediening, wel wat druk op zaterdag.', 4, current_date - 5),
      (bid, 'Sam', 'Mooie zaak, goede muziek.', 5, current_date - 9);
  end if;
end $$;
