# O Quarto Elemento — v5.3 Supabase First

Esta versão consolida o Supabase como destino principal de escrita editorial.

## O que mudou

- `Salvar alterações` grava no Supabase como fonte principal.
- `content.json` permanece como fallback de leitura, mas não é mais atualizado em produção.
- Backups deixam de depender do filesystem da Vercel.
- Antes de cada save, o Content Studio tenta criar um snapshot em `qe_backups`.
- `/api/admin/backups` lista backups do Supabase primeiro.

## Passo obrigatório para quem já criou o schema antes da v5.3

No Supabase:

1. Abra **SQL Editor**.
2. Cole o conteúdo de `docs/SUPABASE_V5_3_BACKUPS.sql`.
3. Clique em **Run**.

Se você executar o `docs/supabase-schema.sql` completo de novo, ele também já contém a tabela `qe_backups`.

## Como validar

1. Entre no Admin em produção.
2. Altere uma descrição curta.
3. Clique em **Salvar alterações**.
4. Confirme a mensagem `Conteúdo salvo em Supabase`.
5. Rode no Supabase:

```sql
select description, updated_at
from qe_transmissions
where slug = 'top-10-misterios-brasileiros';
```

6. Confira backups:

```sql
select id, reason, summary, created_at
from qe_backups
order by created_at desc;
```

## Observação

O fallback JSON continua existindo para proteger o site caso o banco fique indisponível, mas o fluxo editorial passa a considerar o Supabase como fonte principal.
