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
Enable **Email** auth (email + password) in your Supabase project settings.

Run the SQL files in this order inside the Supabase SQL editor:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

### Seed mock employee login accounts
The `/login` page uses Supabase email/password authentication.

1. Set a local env var for the admin seed script:
   - `SUPABASE_SERVICE_ROLE_KEY` (service role key from Supabase)
2. Seed the demo auth users (reads committed credentials from `auth-mock-employees.txt`):

```bash
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-mock-employees.js
```

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
