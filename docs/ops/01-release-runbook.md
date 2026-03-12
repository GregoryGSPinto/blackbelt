# Release Runbook

1. `pnpm install`
2. `pnpm lint`
3. `pnpm test`
4. `pnpm build`
5. `pnpm build:mobile`
6. `npx cap sync ios`
7. `npx cap sync android`
8. Archive/signing manual

## Status

- passos 1-4 válidos
- passos 5-7 bloqueados
