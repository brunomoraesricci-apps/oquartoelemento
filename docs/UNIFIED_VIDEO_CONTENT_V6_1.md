# v6.1 — Unified Video Content

Relatos deixam de ser um cadastro separado e passam a ser vídeos dentro de `qe_transmissions`, usando o campo `content_type`.

## Modelo

- `content_type = transmissao`
- `content_type = relato`
- `content_type = short`
- `content_type = especial`

A tabela `qe_reports` permanece apenas como legado/fallback. Os placeholders antigos não são migrados automaticamente.

## Migração necessária

Execute no Supabase SQL Editor:

```sql
-- docs/SUPABASE_V6_1_UNIFIED_VIDEO_CONTENT.sql
```

## Hero

O carrossel fica limitado a 5 vídeos. Ao salvar, itens excedentes são removidos do Hero.
