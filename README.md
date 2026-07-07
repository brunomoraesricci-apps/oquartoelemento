# O Quarto Elemento — v3.1 Suspense Fix

Correção do erro de build/rota em `/transmissoes`.

## Erro corrigido

```text
useSearchParams() should be wrapped in a suspense boundary at page "/transmissoes"
```

## O que foi ajustado

- A página `/transmissoes` agora usa um wrapper com `<Suspense>`.
- O componente que usa `useSearchParams()` foi movido para `TransmissoesContent`.
- O fallback mantém o visual de loading do Quarto Elemento.

## Testar

```bash
npm install
npm run build
npm run dev
```
