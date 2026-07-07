-- O Quarto Elemento — v5.3 Supabase First / Database Backups
-- Execute once in Supabase > SQL Editor if your schema was created before v5.3.

create extension if not exists pgcrypto;

create table if not exists public.qe_backups (
  id uuid primary key default gen_random_uuid(),
  reason text default 'manual-save',
  snapshot jsonb not null,
  summary jsonb default '{}'::jsonb,
  created_by text default 'content-studio',
  created_at timestamptz default now()
);

alter table public.qe_backups enable row level security;

do $$ begin
  create policy "Admin public read backups" on public.qe_backups for select using (true);
exception when duplicate_object then null; end $$;
