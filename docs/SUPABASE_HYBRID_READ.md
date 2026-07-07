# O Quarto Elemento — Supabase Hybrid Read v5.1

Esta versão ativa a leitura híbrida do acervo público.

## Como funciona

O site tenta ler o conteúdo do Supabase primeiro.

```text
Supabase disponível e com dados?
  Sim -> Site usa Supabase
  Não -> Site usa data/content.json
```

Isso permite migrar produção com baixo risco. Se o Supabase estiver indisponível, o site continua usando o JSON local como fallback.

## O que muda nesta versão

- `lib/content.ts` agora possui `getContentAsync()`.
- Páginas públicas usam leitura assíncrona.
- Página `/transmissoes` deixou de importar `data/content.json` diretamente no componente client.
- Rotas públicas relevantes usam `force-dynamic` para refletir dados do Supabase sem depender de novo deploy.
- `lib/supabaseContent.ts` agora reconstrói o modelo do site a partir das tabelas Supabase.

## Antes de publicar em produção

1. Confirme que o schema foi criado no Supabase.
2. No Admin local, acesse **Banco de Dados**.
3. Clique em **Verificar conexão**.
4. Clique em **Importar JSON para Supabase**.
5. Confira se categorias, transmissões, arquivos, relatos e timeline aparecem nas tabelas.
6. Rode localmente:

```bash
npm run build
npm run dev
```

7. Teste as páginas:

```text
/
/transmissoes
/arquivos
/relatos
/explorar
/linha-do-tempo
/categorias/ovnis-e-fenomenos
/arquivos/operacao-prato
```

## Variáveis necessárias na Vercel

Cadastrar em **Project > Settings > Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

A `SUPABASE_SERVICE_ROLE_KEY` é secreta. Nunca colocar no GitHub.

## Estratégia recomendada

Depois do deploy, validar no domínio público.

Se algo falhar, o site deve continuar funcionando via fallback JSON.

A próxima fase será v5.2 — Hybrid Write, onde o Content Studio salvará JSON e Supabase em paralelo.
