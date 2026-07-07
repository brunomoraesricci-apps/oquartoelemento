# O Quarto Elemento — Visibility Publishing v6.3

Esta versão simplifica o fluxo editorial: o Content Studio deixa de usar status complexos como rascunho, em análise e oculto.

## Novo conceito

Todo conteúdo agora usa apenas:

- `Público`: aparece no site público.
- `Privado`: permanece apenas no Content Studio.

## Comportamento

- Nova publicação por URL nasce como `Privado` por padrão.
- Para publicar no site, altere a visibilidade para `Público` e clique em **Salvar alterações**.
- Conteúdos privados não aparecem em Home, Transmissões, Relatos, Arquivos, Categorias, Busca pública e Sitemap.
- O Hero só usa vídeos públicos.

## Compatibilidade

Valores antigos são normalizados automaticamente:

- `Publicado`, `published`, `public`, `ativo` => `Público`
- `Rascunho`, `Oculto`, `Em análise`, `Recebido` e demais valores => `Privado`

## Banco de dados

Não há novo SQL obrigatório. O campo `status` existente continua sendo usado.
