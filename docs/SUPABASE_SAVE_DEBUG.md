# O Quarto Elemento — v5.2.1 Save Debug

Esta versão melhora a observabilidade do salvamento híbrido.

## O que mudou

- O botão **Salvar Alterações** mostra `Salvando...` durante o POST.
- O Admin exibe sucesso ou erro no topo da tela.
- Em caso de erro, aparece um bloco **Detalhes técnicos do último save**.
- A API `/api/admin/content` retorna `table`, `step`, `supabase`, `completedSteps` e `durationMs`.
- O backend imprime logs no terminal/Vercel Logs com o prefixo `[QE SAVE]`.
- O upsert no Supabase agora remove duplicidades pelo campo de conflito antes de enviar os dados.

## Como testar

1. Altere uma descrição curta em `/admin`.
2. Clique em **Salvar Alterações**.
3. Se der sucesso, rode no Supabase:

```sql
select code, title, slug, description, updated_at
from qe_transmissions
where slug = 'o-misterio-de-dyatlov-pass';
```

4. Se der erro, abra o bloco **Detalhes técnicos do último save** e copie a mensagem.

## Onde ver logs na Vercel

Vercel → Project → Logs → filtre por:

```text
[QE SAVE]
```

