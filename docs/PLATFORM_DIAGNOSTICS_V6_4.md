# O Quarto Elemento v6.4 — Platform Diagnostics

Esta versão adiciona uma camada técnica de diagnóstico para o Content Studio.

## Antes de testar

Execute no SQL Editor do Supabase:

```text
docs/SUPABASE_V6_4_DIAGNOSTICS.sql
```

## O que validar

1. Acesse `/admin`.
2. Abra **Dados → Diagnóstico**.
3. Clique em **Executar diagnóstico**.
4. Confirme:
   - Supabase configurado.
   - Admin/Service Role configurado.
   - Tabelas obrigatórias disponíveis.
   - Migrações ativas.
   - Contagens coerentes.

## Observação

O diagnóstico não expõe valores secretos. Ele mostra apenas se as variáveis estão configuradas.
