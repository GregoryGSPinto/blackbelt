# Store Submission Validation

Date: 2026-03-13

## Status Summary

- Build status: PASS
- Mobile build: PASS
- Native sync: PASS
- Current canonical Capacitor asset directory: `mobile-build/`
- Compliance release pack: PASS WITH EXTERNAL INPUTS PENDING

## Root Cause That Was Fixed

The repository had two conflicting mobile release models at the same time:

1. `capacitor.config.ts` and the newer shell generator used `mobile-build/`.
2. Older scripts and release docs still expected a full static export in `out/`.
3. `next.config.js` still forced `output: 'export'` under `CAPACITOR_BUILD=true`, even though the real mobile strategy had already moved to a hosted Capacitor shell.

That mismatch caused release operators to run the wrong flow and left validation documents claiming `cap sync` should read `out/`, which no longer matched the actual codebase.

## Canonical Mobile Pipeline

- Web/server build: `pnpm build`
- Mobile web assets: `CAPACITOR_BUILD=true pnpm build`
- Canonical Capacitor asset directory: `mobile-build/`
- Sync both native projects: `pnpm mobile:sync`
- Sync iOS only: `pnpm mobile:sync:ios`
- Sync Android only: `pnpm mobile:sync:android`

## Validation Executed

```bash
pnpm build
CAPACITOR_BUILD=true pnpm build
npx cap sync ios
npx cap sync android
```

## Validation Result

- `pnpm build` passes and preserves the standard hosted Next.js deployment path.
- `CAPACITOR_BUILD=true pnpm build` passes and generates `mobile-build/index.html` plus `mobile-build/mobile-shell.json`.
- `npx cap sync ios` passes using `mobile-build/`.
- `npx cap sync android` passes using `mobile-build/`.

## Files Updated For This Fix

- `package.json`
- `next.config.js`
- `capacitor.config.ts`
- `scripts/run-build.mjs`
- `scripts/build-capacitor.sh`
- `scripts/build-native.sh`
- `scripts/capacitor-setup.sh`
- `README.md`
- `SUBMISSION_CHECKLIST.md`
- `docs/ops/01-release-runbook.md`
- `docs/mobile/05-final-mobile-build-command.md`

## Final Decision

🟢 MOBILE PIPELINE READY FOR STORE PACKAGING

Notes:

- This validation closes the `out/` vs `mobile-build/` packaging inconsistency.
- Release compliance paths are now canonical and visible:
  - in-app deletion entry: account menu and `Configurações -> Minha Conta`
  - public deletion URL: `/excluir-conta`
  - support URL: `/suporte`
  - privacy URL: `/politica-privacidade`
  - terms URL: `/termos-de-uso`
- Store submission still depends on external requirements such as signing, hosted environment validation, reviewer credentials, final legal entity data, and production OAuth credentials.
