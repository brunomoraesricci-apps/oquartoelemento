# O Quarto Elemento — Supabase Foundation v5.0

Esta versão prepara o projeto para migrar do `data/content.json` para Supabase sem quebrar o site atual.

## 1. Variáveis locais

Crie/atualize `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ryaihpiqvrymjqlewdud.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_b3Icvte2tEOZZEYHTebIqg_41cQBIlN
SUPABASE_SERVICE_ROLE_KEY=cole-a-service-role-key-apenas-localmente-ou-na-vercel
```

A `publishable key` pode ser pública. A `service role key` é secreta e nunca deve ir para GitHub.

## 2. Criar tabelas

No Supabase:

1. Abra **SQL Editor**.
2. Cole o conteúdo de `docs/supabase-schema.sql`.
3. Clique em **Run**.

## 3. Testar conexão

Com o site local rodando e logado no Admin:

- Acesse **Content Studio > Banco de Dados**.
- Clique em **Verificar conexão**.

## 4. Importar JSON atual

Ainda no painel **Banco de Dados**:

- Clique em **Importar JSON para Supabase**.

Isso lê o `data/content.json` atual e faz `upsert` nas tabelas do Supabase.

## 5. Produção

Na Vercel, cadastre as mesmas variáveis em:

`Project > Settings > Environment Variables`

Depois faça um novo deploy.

## Escopo desta versão

- Cria clients Supabase server/public.
- Adiciona SQL schema.
- Adiciona APIs protegidas para status/importação.
- Mantém o site lendo JSON por enquanto.
- Prepara a próxima fase: leitura híbrida JSON/Supabase.
