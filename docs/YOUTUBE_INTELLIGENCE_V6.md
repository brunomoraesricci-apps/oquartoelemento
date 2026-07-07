# v6.0 — YouTube Intelligence Foundation

Esta versão transforma uma URL do YouTube em um rascunho editorial estruturado sem usar API paga.

## O que a v6.0 extrai

- `videoId`
- URL canônica do YouTube
- URL de embed
- thumbnail pública (`maxresdefault`)
- código QE sugerido
- slug sugerido
- transmissão em rascunho
- dossiê inicial opcional
- QE Package v1.1

## Antes de testar

Execute no Supabase SQL Editor:

```sql
-- docs/SUPABASE_V6_0_SOURCES.sql
```

Esse script cria a tabela `qe_sources` e adiciona campos de origem na tabela `qe_transmissions`.

## Fluxo de teste

1. Entre no Admin.
2. Abra **Nova Publicação**.
3. Cole uma URL do YouTube.
4. Preencha um título editorial.
5. Clique em **Gerar rascunho inteligente**.
6. Revise o QE Package.
7. Clique em **Aplicar localmente**.
8. Clique em **Salvar alterações**.
9. Confira no Supabase:

```sql
select title, slug, video_id, embed_url, source_provider, source_url
from qe_transmissions
order by updated_at desc;
```

E também:

```sql
select provider, provider_id, original_url, embed_url, thumbnail_url
from qe_sources
order by updated_at desc;
```

## Limite da v6.0

A v6.0 não consulta a API oficial do YouTube. Ela trabalha apenas com a URL. Título real, descrição, duração, data de publicação e tags entram na v6.1 com YouTube Data API.
