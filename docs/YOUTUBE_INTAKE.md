# O Quarto Elemento — YouTube Intake v5.6

Esta versão adiciona um fluxo inicial para criar publicações a partir de uma URL do YouTube, sem custo de API.

## Como funciona

1. Acesse **Content Studio > Nova Publicação**.
2. Cole a URL do YouTube.
3. Informe título editorial, categoria, ano e descrição curta.
4. Clique em **Gerar pacote**.
5. Revise o QE Package gerado.
6. Clique em **Aplicar localmente**.
7. Revise os dados no editor.
8. Clique em **Salvar alterações** para gravar no Supabase.

## Limitação importante

A v5.6 não consulta a API oficial do YouTube. Ela extrai somente o `videoId` da URL e monta a thumbnail pública:

```text
https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
```

Isso mantém o fluxo gratuito e sem dependências externas. Em versões futuras, poderemos usar a API do YouTube ou IA para buscar título, descrição e metadados automaticamente.

## Próximo passo sugerido

A v5.7 pode adicionar:

- feedback mais claro no reset/reimportação;
- histórico visual dos últimos pacotes;
- validação de slug duplicado;
- opção de importar múltiplas URLs.
