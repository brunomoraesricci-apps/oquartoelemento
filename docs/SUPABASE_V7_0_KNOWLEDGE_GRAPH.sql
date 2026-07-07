-- O Quarto Elemento - v7.0 Knowledge Graph Foundation
-- Cria tabelas para entidades e relações editoriais.

create table if not exists public.qe_entities (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  type text not null default 'entity',
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.qe_content_entities (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  content_slug text not null,
  entity_key text not null references public.qe_entities(key) on delete cascade,
  relation_type text not null default 'mentions',
  weight numeric not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (content_type, content_slug, entity_key, relation_type)
);

create table if not exists public.qe_content_relations (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_slug text not null,
  target_type text not null,
  target_slug text not null,
  relation_type text not null default 'related_to',
  confidence numeric not null default 1,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (source_type, source_slug, target_type, target_slug, relation_type)
);

create index if not exists qe_entities_type_idx on public.qe_entities(type);
create index if not exists qe_content_entities_content_idx on public.qe_content_entities(content_type, content_slug);
create index if not exists qe_content_entities_entity_idx on public.qe_content_entities(entity_key);
create index if not exists qe_content_relations_source_idx on public.qe_content_relations(source_type, source_slug);
create index if not exists qe_content_relations_target_idx on public.qe_content_relations(target_type, target_slug);

alter table public.qe_entities enable row level security;
alter table public.qe_content_entities enable row level security;
alter table public.qe_content_relations enable row level security;

do $$ begin
  create policy "Public read entities" on public.qe_entities for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Public read content entities" on public.qe_content_entities for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Public read content relations" on public.qe_content_relations for select using (true);
exception when duplicate_object then null; end $$;

insert into public.qe_migrations(version, description)
values ('005', 'Knowledge Graph Foundation')
on conflict (version) do update set description = excluded.description;
