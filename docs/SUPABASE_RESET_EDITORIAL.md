# v5.5 — Supabase Editorial Reset

Esta versão adiciona um reset seguro do acervo oficial no Content Studio.

## Objetivo

Permitir limpar a base do Supabase para reconstruir o acervo pelo novo fluxo editorial:

```text
YouTube URL / roteiro
↓
ChatGPT
↓
QE Package
↓
Content Studio
↓
Supabase
```

## Onde acessar

```text
/admin
↓
Fonte de Dados
↓
Reset editorial seguro
```

## Modos

### Reset padrão

Digite exatamente:

```text
LIMPAR ACERVO QUARTO ELEMENTO
```

Limpa:

- `qe_transmissions`
- `qe_archives`
- `qe_reports`
- `qe_timeline_events`

Mantém:

- `qe_categories`
- `qe_site_settings`
- `qe_backups`

Também redefine o Hero para um estado neutro de reconstrução.

### Reset completo

Marque **Reset completo** e digite exatamente:

```text
LIMPAR TUDO QUARTO ELEMENTO
```

Limpa também:

- `qe_categories`

Mantém:

- `qe_site_settings`
- `qe_backups`

## Segurança

Antes de limpar, o sistema tenta criar um snapshot na tabela:

```text
qe_backups
```

O reset só pode ser executado com `SUPABASE_SERVICE_ROLE_KEY` configurada.

## Próximo passo

Depois desta versão, a evolução natural é a v5.6:

- Criar fluxo de publicação a partir de URL do YouTube.
- Gerar QE Package com ChatGPT.
- Popular o acervo limpo com conteúdo revisado.
