# ArifMind

ArifMind is a responsive Knowledge Management portal prototype for ArifPay. It packages the KM strategy from `KM.md` into a fintech-styled Next.js app with:

- a searchable wiki for API docs and operational manuals
- a technical lessons learned log
- a localization directory for regional Ethiopian market insight
- an expert finder for internal superpowers

## Stack

- Next.js App Router
- Tailwind CSS v4
- shadcn/ui
- Lucide icons
- Supabase Auth + Postgres + RLS
- Vercel deployment target

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.example .env.local
```

3. Add your Supabase values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

4. Run the app:

```bash
npm run dev
```

If the Supabase env vars are missing, ArifMind still runs in demo mode using seeded in-app mock data so the prototype remains reviewable.

## Supabase setup

Run the SQL files in this order inside the Supabase SQL editor:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

The schema includes:

- `profiles`
- `wiki_articles`
- `lessons_learned`
- `localization_entries`
- `expert_profiles`

The security model is based on three roles in `profiles.role`:

- `admin`
- `employee`
- `field_agent`

## Deployment on Vercel

1. Import this repository into Vercel.
2. Add the same two environment variables from `.env.local`.
3. Deploy.

Vercel will build the Next.js app automatically with the default `npm run build` command.
