# O Quarto Elemento — v4.3 Editorial Dashboard

Entrega focada em transformar o Dashboard do Content Studio em uma visão operacional de publicação.

## Novidades

- Dashboard editorial com saúde do acervo.
- Última transmissão publicada.
- Hero ativo e quantidade de itens no carrossel.
- Último backup criado automaticamente.
- Fila editorial por status: publicado, rascunho e revisão.
- Pendências detectadas: SEO, imagens e categorias sem imagem.
- Checklist operacional com atalhos para as seções corretas.
- Mantém login protegido, QE Package, simulação de pacote e backup automático da v4.2.

## Como rodar

Crie `.env.local` com base no `.env.example`:

```env
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=sua-senha-forte
ADMIN_SESSION_SECRET=um-segredo-longo-aleatorio
```

Depois:

```bash
npm install
npm run build
npm run dev
```

## Testes principais

- `/admin` deve exigir login.
- Dashboard deve mostrar cards editoriais e pendências.
- Central de Publicação deve simular e aplicar pacote localmente.
- Salvar alterações deve criar backup em `data/backups`.
- Logout deve encerrar a sessão.

## v5.1 — Supabase Foundation

Esta versão adiciona a fundação Supabase sem remover o JSON atual.

- Schema SQL em `docs/supabase-schema.sql`
- Guia de migração em `docs/SUPABASE_MIGRATION.md`
- Clients Supabase em `lib/supabase.ts`
- Importador JSON → Supabase protegido por login admin
- Painel **Banco de Dados** dentro do Content Studio

Para instalar a nova dependência:

```bash
npm install
```

Depois configure `.env.local` e rode:

```bash
npm run dev
```


## v5.1 — Hybrid Read

Leitura pública com Supabase como fonte principal e fallback automático para `data/content.json`. Consulte `docs/SUPABASE_HYBRID_READ.md`.


## v5.2 — Hybrid Write

- Content Studio agora salva no Supabase como destino principal.
- `content.json` permanece como backup/fallback local.
- Admin lê conteúdo via Hybrid Read para refletir o banco.
- Consulte `docs/SUPABASE_HYBRID_WRITE.md`.
