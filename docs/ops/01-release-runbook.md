# Release Runbook

1. `pnpm install`
2. `pnpm typecheck`
3. `pnpm lint`
4. `pnpm test`
5. `npx next build --webpack`
6. `pnpm mobile:runtime:check`
7. `pnpm exec tsx scripts/validate-stripe-release.ts`
8. `pnpm mobile:build:web`
9. `pnpm mobile:sync:ios`
10. `pnpm mobile:sync:android`
11. Archive/signing manual

## Status

- o gate mínimo de release agora exige validação explícita de tenancy/billing/mobile antes de sync nativo

## External Inputs Still Required

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `SUPPORT_EMAIL`
- `PRIVACY_EMAIL`
- `CAPACITOR_SERVER_URL` ou fallback consciente em `NEXT_PUBLIC_APP_URL`
- `CAPACITOR_FALLBACK_URLS` se a operação não aceitar modo single-host
