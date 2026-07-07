# O Quarto Elemento — v6.2 Auto Dossier Generation

Esta versão consolida o fluxo de publicação por URL do YouTube.

## Objetivo

Evitar double-input entre Transmissões e Arquivos.

A partir de agora, uma nova publicação pode criar automaticamente:

- um vídeo em `qe_transmissions`;
- um arquivo/dossiê em `qe_archives`;
- o relacionamento entre os dois;
- o pacote QE correspondente.

## Fluxo recomendado

1. Acesse **Content Studio > Nova Publicação**.
2. Cole a URL do YouTube.
3. Escolha o tipo de conteúdo: transmissão, relato, short ou especial.
4. Mantenha marcado **Criar arquivo/dossiê automaticamente**.
5. Clique em **Gerar publicação + dossiê**.
6. Clique em **Aplicar localmente**.
7. Revise o conteúdo.
8. Clique em **Salvar alterações**.

## Modelo

O vídeo é a fonte principal da publicação. O arquivo/dossiê é derivado dele e pode ser enriquecido depois.

```text
YouTube URL
  ↓
Vídeo / Transmissão
  ↓
Arquivo / Dossiê automático
  ↓
Supabase
```

## Observação

Esta versão não exige nova migração SQL. Ela usa as tabelas já criadas nas versões anteriores.
