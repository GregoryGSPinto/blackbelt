# Release Runbook

1. `pnpm install`
2. `pnpm lint`
3. `pnpm test`
4. `pnpm build`
5. `pnpm mobile:runtime:check`
6. `pnpm mobile:build:web`
7. `pnpm mobile:sync:ios`
8. `pnpm mobile:sync:android`
9. Archive/signing manual

## Status

- passos 1-8 validados para o pipeline atual
