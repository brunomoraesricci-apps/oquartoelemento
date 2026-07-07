-- O Quarto Elemento v7.1 - Timeline Intelligence
-- Enriquece a tabela de timeline para vincular eventos automaticamente a vídeos/dossiês.

alter table public.qe_timeline_events
  add column if not exists content_slug text,
  add column if not exists content_type text,
  add column if not exists event_type text default 'publication',
  add column if not exists precision text default 'year',
  add column if not exists is_auto boolean default true;

create index if not exists qe_timeline_events_content_slug_idx
  on public.qe_timeline_events (content_slug);

create index if not exists qe_timeline_events_archive_slug_idx
  on public.qe_timeline_events (archive_slug);

create index if not exists qe_timeline_events_event_type_idx
  on public.qe_timeline_events (event_type);

insert into public.qe_migrations (version, description, raw)
values
  ('006', 'Timeline Intelligence and automatic publication events', '{"file":"SUPABASE_V7_1_TIMELINE_INTELLIGENCE.sql"}'::jsonb)
on conflict (version) do update set
  description = excluded.description,
  raw = excluded.raw;
