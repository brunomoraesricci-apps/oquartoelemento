# QE Content Package Specification v1.0

O **QE Content Package** é o formato padrão para publicar conteúdo no Content Studio do site **O Quarto Elemento**.

A ideia é simples: o ChatGPT gera um bloco de texto estruturado, você cola na **Central de Publicação**, valida o pacote e o Admin distribui as informações para Transmissões, Arquivos, Relatos, Categorias, Hero e Timeline.

## Fluxo recomendado

1. Produzir ou publicar o vídeo.
2. Pedir ao ChatGPT para gerar um `QE Content Package`.
3. Copiar o bloco completo.
4. Abrir `/admin` → **Central de Publicação**.
5. Colar o pacote.
6. Clicar em **Validar pacote**.
7. Clicar em **Processar pacote**.
8. Revisar os dados importados.
9. Clicar em **Salvar alterações**.

## Cabeçalho

```txt
QE_PACKAGE_VERSION: 1.0
```

## Blocos suportados

- `TRANSMISSION`
- `ARCHIVE`
- `REPORT`
- `CATEGORY`
- `HERO`
- `TIMELINE`

Cada bloco deve terminar com `END_NOME_DO_BLOCO`.

Exemplo:

```txt
TRANSMISSION
TITLE: Top 10 Mistérios Brasileiros
SLUG: top-10-misterios-brasileiros
END_TRANSMISSION
```

## Campos principais — TRANSMISSION

```txt
TRANSMISSION
CODE: QE-TX-001
TITLE: Título da transmissão
SLUG: slug-da-transmissao
CATEGORY: OVNIs e Fenômenos
YEAR: 2026
STATUS: Publicado
YOUTUBE: https://youtube.com/watch?v=...
IMAGE: /images/thumb.jpg
HERO: true
HERO_ORDER: 1
DESCRIPTION:
Descrição curta da transmissão.
TAGS:
- tag 1
- tag 2
SEO_TITLE: Título para Google
SEO_DESCRIPTION: Descrição para Google e redes sociais
OG_IMAGE: /images/og.jpg
RELATED_ARCHIVES:
- operacao-prato
- incidente-de-ubatuba
RELATED_REPORTS:
- RP-001
AI_NOTES:
Notas editoriais geradas pela IA.
END_TRANSMISSION
```

## Campos principais — ARCHIVE

```txt
ARCHIVE
CODE: QE-001
TITLE: Operação Prato
SLUG: operacao-prato
CATEGORY: OVNIs e Fenômenos
YEAR: 1977
LOCATION: Pará, Brasil
CLASSIFICATION: Desclassificado
ACCESS_LEVEL: LV.04
STATUS: Publicado
SUMMARY:
Resumo curto do dossiê.
DESCRIPTION:
Descrição exibida nos cards e previews.
LONG_DESCRIPTION:
Texto principal do dossiê.
IMAGE: /images/operacao-prato.jpg
RELATED_TRANSMISSION: top-10-misterios-brasileiros
RELATED_ARCHIVES:
- incidente-de-ubatuba
RELATED_REPORTS:
- RP-001
TAGS:
- ovni
- amazônia
SEO_TITLE: Operação Prato | Dossiê Desclassificado
SEO_DESCRIPTION: Dossiê investigativo sobre a Operação Prato.
OG_IMAGE: /images/operacao-prato-og.jpg
AI_NOTES:
Notas editoriais.
END_ARCHIVE
```

## Campos principais — REPORT

```txt
REPORT
CODE: RP-001
TITLE: Luzes sobre a estrada
SUBTITLE: Relato recebido
CATEGORY: Relatos
YEAR: 2026
LOCATION: Interior de São Paulo
STATUS: Recebido
IMAGE: /images/relato.jpg
YOUTUBE: https://youtube.com/watch?v=...
DESCRIPTION:
Descrição do relato.
RELATED_ARCHIVE: operacao-prato
RELATED_TRANSMISSION: top-10-misterios-brasileiros
TAGS:
- relato
- luzes
AI_NOTES:
Relato fictício para ambientação.
END_REPORT
```

## Campos principais — CATEGORY

```txt
CATEGORY
TITLE: OVNIs e Fenômenos
SLUG: ovnis-e-fenomenos
SYMBOL: ◇
IMAGE: /images/category-ovni.jpg
DESCRIPTION:
Categoria dedicada a fenômenos aéreos, avistamentos e casos não explicados.
STATUS: Publicado
ORDER: 1
ACTIVE: true
END_CATEGORY
```

## Campos principais — HERO

```txt
HERO
TITLE: Arquivos Investigativos
SUBTITLE: Transmissões classificadas
DESCRIPTION:
Acesse dossiês, transmissões e relatos do acervo.
IMAGE: /images/hero.jpg
FEATURED_ARCHIVE: operacao-prato
FEATURED_TRANSMISSION: top-10-misterios-brasileiros
YOUTUBE: https://youtube.com/watch?v=...
END_HERO
```

## Campos principais — TIMELINE

```txt
TIMELINE
YEAR: 1977
TITLE: Início da Operação Prato
TEXT:
Registros oficiais e relatos civis passam a compor um dos casos mais conhecidos da ufologia brasileira.
END_TIMELINE
```

## Observações

- O parser aceita chaves em maiúsculo, minúsculo, com espaço ou underscore.
- Listas podem ser escritas com `- item` ou separadas por vírgula.
- O importador faz upsert por `slug` ou `code` quando possível.
- O pacote é aplicado localmente primeiro. Para gravar de fato, clique em **Salvar alterações**.
- O formato foi desenhado para ser gerado por ChatGPT hoje e por APIs/IA no futuro, sem mudar o Admin.

## Fluxo de segurança — v4.2

A Central de Publicação agora trabalha com um fluxo em duas etapas:

1. **Simular pacote** — faz um dry run, identifica criações, atualizações e alertas.
2. **Aplicar localmente** — atualiza o estado do Content Studio, mas ainda não grava no JSON.
3. **Salvar alterações** — grava o `data/content.json`.

Antes de cada salvamento, o Admin cria automaticamente um backup em:

```txt
data/backups/
```

Isso permite manter uma trilha de segurança enquanto o projeto ainda usa JSON local.

### Alertas de validação

A simulação pode indicar:

- categoria inexistente;
- imagem ausente;
- SEO incompleto;
- item que será criado;
- item que será atualizado por slug ou code.

Esses alertas não impedem a importação. Eles funcionam como checklist editorial antes da publicação.
