# O Quarto Elemento — v7.0 Knowledge Graph Foundation

Esta versão inicia a camada de conhecimento do Content Studio.

## O que muda

- Novo menu **Grafo** no Content Studio.
- O grafo é inferido a partir de vídeos, arquivos, categorias, tags e relações existentes.
- O painel mostra nós, relações, entidades, pendências, vídeos sem dossiê e possíveis duplicidades.
- Novas tabelas opcionais para persistir entidades e relações no Supabase.

## SQL obrigatório para ativar schema 005

Execute no Supabase SQL Editor:

```text
docs/SUPABASE_V7_0_KNOWLEDGE_GRAPH.sql
```

## Conceito

A partir da v7, o acervo deixa de ser apenas uma lista de vídeos e dossiês. Ele passa a ser tratado como uma rede:

```text
Vídeo → Categoria
Vídeo → Tags
Vídeo → Dossiê
Dossiê → Transmissão
Conteúdo → Entidades
Conteúdo → Relações
```

## Próximas evoluções

- v7.1: salvar entidades inferidas em `qe_entities`.
- v7.2: sugerir relações automaticamente via IA.
- v7.3: exibir casos relacionados no site público com base no grafo.
