-- O Quarto Elemento — Supabase Foundation Schema v5.0
-- Run this in Supabase > SQL Editor before importing content.

create extension if not exists pgcrypto;

create table if not exists public.qe_categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  symbol text,
  description text,
  image text,
  status text default 'Publicado',
  sort_order integer default 0,
  active boolean default true,
  seo_title text,
  seo_description text,
  og_image text,
  ai_notes text,
  raw jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.qe_transmissions (
  id uuid primary key default gen_random_uuid(),
  code text,
  title text not null,
  slug text not null unique,
  description text,
  image text,
  youtube_url text,
  category_slug text,
  status text default 'Publicado',
  published_at text,
  year text,
  location text,
  duration text,
  views text,
  show_in_hero boolean default false,
  hero_order integer default 0,
  tags text[] default '{}',
  related_archives text[] default '{}',
  related_report_codes text[] default '{}',
  seo_title text,
  seo_description text,
  og_image text,
  ai_generated boolean default false,
  ai_reviewed boolean default false,
  ai_notes text,
  ai_source_url text,
  raw jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.qe_archives (
  id uuid primary key default gen_random_uuid(),
  code text,
  title text not null,
  slug text not null unique,
  summary text,
  description text,
  long_description text,
  image text,
  category_slug text,
  status text default 'Publicado',
  location text,
  year text,
  classification text,
  access_level text,
  related_transmission_slug text,
  related_archives text[] default '{}',
  related_report_codes text[] default '{}',
  tags text[] default '{}',
  seo_title text,
  seo_description text,
  og_image text,
  ai_generated boolean default false,
  ai_reviewed boolean default false,
  ai_notes text,
  ai_source_url text,
  raw jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.qe_reports (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  slug text,
  subtitle text,
  description text,
  image text,
  youtube_url text,
  category_slug text,
  status text default 'Recebido',
  location text,
  year text,
  related_archive_slug text,
  related_transmission_slug text,
  tags text[] default '{}',
  seo_title text,
  seo_description text,
  og_image text,
  ai_generated boolean default false,
  ai_reviewed boolean default false,
  ai_notes text,
  ai_source_url text,
  raw jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.qe_timeline_events (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  title text not null,
  description text,
  archive_slug text,
  sort_order integer default 0,
  raw jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(title, year)
);

create table if not exists public.qe_site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.qe_categories enable row level security;
alter table public.qe_transmissions enable row level security;
alter table public.qe_archives enable row level security;
alter table public.qe_reports enable row level security;
alter table public.qe_timeline_events enable row level security;
alter table public.qe_site_settings enable row level security;

-- Public read policies. Admin writes use SUPABASE_SERVICE_ROLE_KEY server-side.
do $$ begin
  create policy "Public read categories" on public.qe_categories for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Public read transmissions" on public.qe_transmissions for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Public read archives" on public.qe_archives for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Public read reports" on public.qe_reports for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Public read timeline" on public.qe_timeline_events for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Public read settings" on public.qe_site_settings for select using (true);
exception when duplicate_object then null; end $$;
