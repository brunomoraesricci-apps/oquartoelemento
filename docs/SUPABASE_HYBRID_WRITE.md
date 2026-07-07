# O Quarto Elemento — Supabase Hybrid Write v5.2

Esta versão muda o fluxo de gravação do Content Studio.

## Arquitetura

Antes:

```text
Content Studio
  ↓
content.json
  ↓
Site
```

Agora:

```text
Content Studio
  ↓
Supabase  ← destino principal
  ↓
Site público via leitura híbrida

content.json permanece como fallback/backup local.
```

## O que muda

- `GET /api/admin/content` passa a carregar o acervo pela leitura híbrida.
- `POST /api/admin/content` salva primeiro no Supabase.
- Depois tenta atualizar `data/content.json` como backup/fallback.
- Em ambientes serverless, como Vercel, o backup em arquivo pode não persistir. Isso é esperado.
- O banco passa a ser a fonte primária de publicação.

## Variáveis obrigatórias em produção

Na Vercel, confirme:

```env
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Após cadastrar ou editar variáveis, faça **Redeploy**.

## Teste recomendado

1. Acesse `/admin` em produção.
2. Entre em **Banco de Dados**.
3. Clique em **Verificar conexão**.
4. Faça uma alteração pequena em uma transmissão ou categoria.
5. Clique em **Salvar alterações**.
6. Confira no Supabase Table Editor se o registro foi atualizado.
7. Abra o site público e valide a alteração.

## Rollback

Como a leitura ainda é híbrida, se o Supabase falhar o site volta para o JSON.

Para rollback completo:

1. Remova temporariamente as variáveis do Supabase na Vercel, ou restaure deploy anterior.
2. Faça redeploy.
3. O site volta a usar `content.json`.
