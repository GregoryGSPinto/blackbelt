# Security Audit

Data: 12 de março de 2026

## Nota

6.5/10

## Achados principais

### Crítica

- Secret real encontrado em arquivo local `/.env.local.backup`
  - evidência: service role key presente no workspace
  - correção aplicada: arquivo passou a ser ignorado pelo git
  - pendência: remover arquivo local e rotacionar segredo fora do repositório
  - risco residual: alto enquanto o segredo continuar válido

### Alta

- Fluxo público de exclusão de conta estava desconectado do endpoint real
  - impacto: promessa de compliance sem execução confiável
  - correção aplicada: `app/excluir-conta/page.tsx` passou a usar `app/api/lgpd/delete/route.ts`; endpoint aceita fluxo autenticado e fluxo público revisado

- Logs podiam vazar emails/tokens
  - correção aplicada: redaction básica em `lib/logger.ts`
  - risco residual: ainda há muitos `console.*` fora do logger central

### Média

- Drift de env Stripe público vs server-only
  - correção aplicada: suporte consistente a `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

- Permissões Android desnecessárias
  - correção aplicada: remoção de `RECEIVE_BOOT_COMPLETED`, `allowBackup=false`, `usesCleartextTraffic=false`

- Declarações iOS incompletas para câmera/fotos
  - correção aplicada: adicionadas usage descriptions e `ITSAppUsesNonExemptEncryption`

## Supply chain

- `pnpm install` concluiu
- warnings:
  - bin do `supabase` não criado corretamente
  - build scripts nativos ignorados pelo `pnpm approve-builds`

## Risco residual

- observabilidade ainda mistura bibliotecas e padrões antigos
- há documentação com credenciais/demo users históricos
- client/server boundary ainda requer revisão adicional endpoint a endpoint
