-- O Quarto Elemento — v6.1 Unified Video Content
-- Migração limpa: relatos passam a ser vídeos via qe_transmissions.content_type.
-- A tabela qe_reports é mantida apenas como legado; não migramos placeholders antigos.

alter table public.qe_transmissions
  add column if not exists content_type text default 'transmissao';

create index if not exists qe_transmissions_content_type_idx
  on public.qe_transmissions(content_type);

-- Conteúdos já existentes continuam como transmissões.
update public.qe_transmissions
set content_type = 'transmissao'
where content_type is null or content_type = '';

-- Limita o carrossel a 5 itens no banco.
with ranked as (
  select id, row_number() over (order by coalesce(hero_order, 999), updated_at desc) as rn
  from public.qe_transmissions
  where show_in_hero = true
)
update public.qe_transmissions t
set show_in_hero = false
from ranked r
where t.id = r.id
  and r.rn > 5;
