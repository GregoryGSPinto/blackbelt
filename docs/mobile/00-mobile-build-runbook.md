# Mobile Build Runbook

## Fonte única

- `capacitor.config.ts` -> `webDir: out`

## Comandos definitivos

- `pnpm build:mobile`
- `npx cap sync ios`
- `npx cap sync android`

## Resultado da auditoria

- `pnpm build:mobile`: falhou
- causa imediata: export estático com prerender error e `ENOENT .next/browser/default-stylesheet.css`
- `npx cap sync ios/android`: falhou porque `out/` não foi gerado

## Decisão operacional

- Não publicar iOS/Android até eliminar dependência quebrada do export estático
