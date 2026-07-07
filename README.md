# O Quarto Elemento — v3.4 Content Studio

Site oficial do canal **O Quarto Elemento**, estruturado como um arquivo investigativo digital.

## Stack

- Next.js App Router
- TypeScript
- Tailwind/CSS customizado
- Vercel
- Cloudflare

## v3.4 — O que mudou

Esta versão reorganiza o Admin para funcionar como um **Content Studio**, reduzindo a exposição de campos técnicos e preparando o painel para automação editorial futura.

### Admin / Content Studio

- Renomeia o painel para **Content Studio**.
- Reorganiza o menu lateral em grupos:
  - Central
  - Conteúdo
  - Publicação
  - Sistema
- Mantém a estrutura atual do site, sem criar novas páginas.
- Transforma o JSON completo em **Modo Dev**.
- Adiciona botão desabilitado **Processar IA**, já preparando a experiência futura.

### Campos recolhidos por contexto

Transmissões, Arquivos, Relatos e Categorias agora exibem campos em blocos recolhíveis:

- Conteúdo principal
- Metadados editoriais
- Relacionamentos
- SEO e compartilhamento
- Automação futura
- Hero, quando aplicável

### Filosofia da versão

A ideia é manter o site simples de manter e forte para evoluir:

- Poucas entidades.
- Menos edição manual técnica.
- Mais foco em conteúdo.
- IA futura como copiloto editorial.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

O deploy é automático pela Vercel após `git push` na branch principal.

## v4.0 — Content Pipeline

Esta versão adiciona a **Central de Publicação** no Admin.

O fluxo editorial agora aceita pacotes TXT estruturados no padrão **QE Content Package v1.0**, permitindo que o ChatGPT gere um pacote completo e o Content Studio distribua os dados para o site.

Documentação do formato:

```txt
docs/QE_PACKAGE_SPEC.md
```

Fluxo:

```bash
npm run dev
# acessar /admin
# abrir Central de Publicação
# colar pacote
# validar
# processar
# salvar alterações
```
