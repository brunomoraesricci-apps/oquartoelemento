# O Quarto Elemento — Supabase Source of Truth v5.4

Esta versão consolida o Supabase como a fonte oficial do acervo editorial.

## Estado da arquitetura

```text
Content Studio
  ↓
Supabase
  ↓
Site público
```

O arquivo `data/content.json` continua existindo, mas agora tem papel secundário:

- fallback emergencial caso o Supabase fique indisponível;
- exportação manual pelo botão **Baixar JSON**;
- reimportação legada pelo painel **Fonte de Dados**;
- backup de referência durante a transição.

## O que mudou na v5.4

- O site público tenta ler do Supabase primeiro.
- O Admin salva no Supabase como destino principal.
- Backups são criados na tabela `qe_backups`.
- O JSON local não é mais tratado como fonte operacional.
- A área **Banco de Dados** foi ajustada para **Fonte de Dados**.
- Textos do Admin deixam claro que o Supabase é a fonte oficial.

## Validação recomendada

1. Acessar `/admin` em produção.
2. Alterar uma descrição curta de transmissão.
3. Clicar em **Salvar alterações**.
4. Validar a mensagem de sucesso.
5. Consultar no Supabase:

```sql
select code, title, slug, description, updated_at
from qe_transmissions
order by updated_at desc;
```

6. Abrir o site público e confirmar a alteração.

## Fallback

Se a leitura do Supabase falhar ou o banco ainda estiver vazio, o site usa `data/content.json` como fallback emergencial.

O fallback deve ser mantido até a base estar 100% limpa, repopulada e validada.

## Próxima fase sugerida

v5.5 — Reset Editorial Seguro

- Backup completo em `qe_backups`.
- Botão de limpeza protegida do acervo.
- Manter categorias/configurações quando desejado.
- Preparar a base para repopulação via URL do YouTube/QE Package.
