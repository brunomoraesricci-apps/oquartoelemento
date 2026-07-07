# O Quarto Elemento — v5.4 Supabase Source of Truth

# O Quarto Elemento — v5.3 Supabase First

Plataforma editorial investigativa do canal O Quarto Elemento.

## v5.3

- Supabase como destino principal de escrita.
- JSON mantido como fallback read-only.
- Backups editoriais salvos no banco (`qe_backups`).
- Remoção do aviso de filesystem da Vercel durante o save.
- Guia: `docs/SUPABASE_FIRST.md`.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```


## v5.4

Supabase passa a ser a fonte oficial do acervo. JSON permanece apenas como fallback/exportação. Guia: `docs/SUPABASE_SOURCE_OF_TRUTH.md`.
