create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'employee', 'field_agent');
create type public.lesson_status as enum ('Open', 'Resolved', 'Monitoring');
create type public.lesson_severity as enum ('Critical', 'High', 'Medium', 'Low');
create type public.review_status as enum ('Reviewed', 'Pending', 'Needs Follow-up');
create type public.expert_availability as enum ('Available', 'Busy', 'On Field Duty');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'employee',
  team text not null default 'General',
  region text,
  languages text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.wiki_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  audience text not null,
  summary text not null,
  content text not null,
  tags text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lessons_learned (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status public.lesson_status not null default 'Open',
  severity public.lesson_severity not null default 'Medium',
  product_area text not null,
  owner text not null,
  root_cause text not null,
  immediate_fix text not null,
  prevention text not null,
  expert_advice text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.localization_entries (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  primary_language text not null,
  key_terms text[] not null default '{}',
  local_business_practice text not null,
  transaction_behavior text not null,
  notes text not null,
  contributor text not null,
  review_status public.review_status not null default 'Pending',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.expert_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role_title text not null,
  team text not null,
  region text not null,
  languages text[] not null default '{}',
  superpowers text[] not null default '{}',
  contact_channel text not null,
  availability public.expert_availability not null default 'Available',
  user_id uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, team)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'employee'),
    coalesce(new.raw_user_meta_data ->> 'team', 'General')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists wiki_articles_set_updated_at on public.wiki_articles;
create trigger wiki_articles_set_updated_at
  before update on public.wiki_articles
  for each row execute procedure public.set_updated_at();

drop trigger if exists lessons_learned_set_updated_at on public.lessons_learned;
create trigger lessons_learned_set_updated_at
  before update on public.lessons_learned
  for each row execute procedure public.set_updated_at();

drop trigger if exists localization_entries_set_updated_at on public.localization_entries;
create trigger localization_entries_set_updated_at
  before update on public.localization_entries
  for each row execute procedure public.set_updated_at();

drop trigger if exists expert_profiles_set_updated_at on public.expert_profiles;
create trigger expert_profiles_set_updated_at
  before update on public.expert_profiles
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.wiki_articles enable row level security;
alter table public.lessons_learned enable row level security;
alter table public.localization_entries enable row level security;
alter table public.expert_profiles enable row level security;

create policy "profiles are readable by authenticated users"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "admins can manage profiles"
  on public.profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "authenticated users can read wiki"
  on public.wiki_articles
  for select
  to authenticated
  using (published = true or public.is_admin());

create policy "admins can manage wiki"
  on public.wiki_articles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "authenticated users can read lessons"
  on public.lessons_learned
  for select
  to authenticated
  using (true);

create policy "authenticated users can insert lessons"
  on public.lessons_learned
  for insert
  to authenticated
  with check (created_by = auth.uid() or created_by is null);

create policy "admins can update lessons"
  on public.lessons_learned
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "authenticated users can read localization"
  on public.localization_entries
  for select
  to authenticated
  using (true);

create policy "authenticated users can insert localization"
  on public.localization_entries
  for insert
  to authenticated
  with check (created_by = auth.uid() or created_by is null);

create policy "admins can update localization"
  on public.localization_entries
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "authenticated users can read experts"
  on public.expert_profiles
  for select
  to authenticated
  using (true);

create policy "admins can manage experts"
  on public.expert_profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
