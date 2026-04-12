# nachtboost (BarBoost)

Next.js app for bar deals and the admin dashboard.

## Supabase (dashboard data)

1. Create a project at [Supabase](https://supabase.com) and open **SQL Editor**.
2. Paste and run `supabase/migrations/0001_barboost.sql` to create tables, indexes, and RLS (no policies — only the service role can read/write via the server).
3. Run `supabase/seed.sql` in the same editor to insert the demo bar `cafe-nova`, deals, reviews, and `bar_dashboard_state`.

### CLI (optional)

With the [Supabase CLI](https://supabase.com/docs/guides/cli) linked to your project:

```bash
supabase db push   # applies migrations from supabase/migrations/
```

Then execute `supabase/seed.sql` in the SQL Editor (or pipe it with `psql` if you use a direct DB URL).

## Local environment

Copy `.env.local.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from **Project Settings → API** in Supabase.

The dashboard reads `?bar=<slug>` (default `cafe-nova`), e.g. `/dashboard` or `/dashboard?bar=cafe-nova`.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
