# V8.1.3 — Motion System

## Objetivo
Adicionar motion design premium na Home Streaming sem alterar a arquitetura do CMS ou o fluxo Supabase.

## Alterações principais
- Framer Motion aplicado na Home Streaming.
- Entrada suave do Hero ao carregar a página.
- Scroll reveal na barra de categorias, bloco de introdução e trilhos.
- Cards com stagger animation dentro de cada carrossel.
- Dossiês recuperados também entram com animação progressiva.
- Respeito a `prefers-reduced-motion` no Hero.

## Arquivos alterados
- `components/StreamingHome.tsx`

## Validação
- `npm run build` executado com sucesso.
