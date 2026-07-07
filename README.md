# O Quarto Elemento — v7.1 Timeline Intelligence

Nova publicação por URL agora gera vídeo + arquivo/dossiê relacionado, evitando double-input no Content Studio.

## Teste

```bash
npm install
npm run build
npm run dev
```

Guia: `docs/AUTO_DOSSIER_GENERATION_V6_2.md`.

# O Quarto Elemento — v6.0 YouTube Intelligence Foundation

Site oficial e Content Studio do O Quarto Elemento.

## Destaques da v6.0

- Nova Publicação evoluída para **YouTube Intelligence**.
- Geração determinística de rascunho a partir de URL do YouTube.
- Extração de `videoId`, embed URL, thumbnail pública e URL canônica.
- QE Package v1.1 com campos de origem (`SOURCE_PROVIDER`, `SOURCE_URL`, `VIDEO_ID`, `EMBED_URL`).
- Nova tabela opcional `qe_sources` para registrar fontes de vídeo.
- Supabase segue como fonte oficial; JSON fica como fallback/exportação.

## Antes de rodar em produção

Execute no Supabase SQL Editor:

```sql
-- docs/SUPABASE_V6_0_SOURCES.sql
```

## Desenvolvimento

```bash
npm install
npm run build
npm run dev
```

## Deploy

```bash
git status
git add .
git commit -m "v6.0 YouTube Intelligence Foundation"
git push origin main
```
