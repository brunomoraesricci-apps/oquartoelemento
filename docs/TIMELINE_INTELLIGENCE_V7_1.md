# O Quarto Elemento — Timeline Intelligence v7.1

Esta versão faz com que a **Nova Publicação por URL** crie automaticamente:

1. Vídeo/transmissão.
2. Arquivo/dossiê inicial.
3. Evento inicial da timeline.

## Banco

Antes de testar, execute no Supabase SQL Editor:

```sql
docs/SUPABASE_V7_1_TIMELINE_INTELLIGENCE.sql
```

O script adiciona metadados à tabela `qe_timeline_events`:

- `content_slug`
- `content_type`
- `event_type`
- `precision`
- `is_auto`

Também registra a migração `006` em `qe_migrations`.

## Fluxo esperado

1. Acesse **Content Studio > Nova Publicação**.
2. Cole uma URL do YouTube.
3. Preencha o título editorial.
4. Deixe **Arquivo automático** marcado.
5. Clique em **Gerar publicação + dossiê + timeline**.
6. Clique em **Aplicar localmente**.
7. Clique em **Salvar alterações**.

Depois disso:

- A transmissão aparece na área correspondente quando pública.
- O arquivo/dossiê é criado com o mesmo slug.
- A página **Linha do Tempo** recebe um evento automático vinculado ao dossiê.

## Observação

O evento gerado é simples de propósito. A ideia é criar a base cronológica automaticamente e permitir enriquecimento manual depois.
