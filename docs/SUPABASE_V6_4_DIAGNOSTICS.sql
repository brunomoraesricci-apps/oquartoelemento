-- O Quarto Elemento v6.4 - Platform Diagnostics
-- Cria controle simples de migrações/schema para o Content Studio.

create table if not exists public.qe_migrations (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  description text,
  executed_at timestamptz not null default now(),
  raw jsonb not null default '{}'::jsonb
);

alter table public.qe_migrations enable row level security;

do $$ begin
  create policy "Public read migrations" on public.qe_migrations for select using (true);
exception when duplicate_object then null; end $$;

insert into public.qe_migrations (version, description, raw)
values
  ('001', 'Initial Supabase schema', '{"file":"supabase-schema.sql"}'::jsonb),
  ('002', 'Backups table', '{"file":"SUPABASE_V5_3_BACKUPS.sql"}'::jsonb),
  ('003', 'Sources table', '{"file":"SUPABASE_V6_0_SOURCES.sql"}'::jsonb),
  ('004', 'Platform diagnostics and migration registry', '{"file":"SUPABASE_V6_4_DIAGNOSTICS.sql"}'::jsonb)
on conflict (version) do update set
  description = excluded.description,
  raw = excluded.raw;
