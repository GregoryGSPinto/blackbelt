# Mobile Build Runbook

## Current Canonical Path

- The hosted Next.js product is validated with `npx next build --webpack`.
- The Capacitor shell is generated from the same app with `CAPACITOR_BUILD=true pnpm build`.
- Capacitor consumes `mobile-build/`.
- `out/` is not part of the current release pipeline.

## Official Commands

### Hosted web validation

```bash
pnpm typecheck
pnpm lint
pnpm test
npx next build --webpack
```

### Mobile shell generation

```bash
pnpm mobile:runtime:check
CAPACITOR_BUILD=true pnpm build
```

### Native sync

```bash
pnpm mobile:sync:ios
pnpm mobile:sync:android
```

## Turbopack vs Webpack

- Webpack is the official release validation path today.
- Turbopack is not the release baseline in this workspace.
- If a local `next build` without `--webpack` behaves differently, treat webpack as the source of truth until the release path is intentionally migrated.

## Known Release Warnings

- `middleware` deprecated in Next 16:
  current file still works, but migration to `proxy` remains planned and should be handled as a controlled platform change, not a last-minute release edit.
- Ignored build scripts on install:
  `supabase` is now explicitly allowed in `package.json` to reduce pnpm install noise.
- Mobile runtime warnings:
  `SUPPORT_EMAIL`, `PRIVACY_EMAIL`, and `CAPACITOR_FALLBACK_URLS` still require explicit production values for broader rollout.

## Release Decision

- Internal and controlled mobile distribution: technically ready after the commands above pass.
- Broad public submission: still depends on the official HTTPS host, operational contacts, and review/legal inputs.
