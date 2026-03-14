# Release Runbook

## Official Release Pipeline

1. `pnpm install`
2. `pnpm typecheck`
3. `pnpm lint`
4. `pnpm test`
5. `npx next build --webpack`
6. `pnpm mobile:runtime:check`
7. `pnpm exec tsx scripts/validate-stripe-release.ts`

For local convenience, `pnpm build:release` runs the same code-quality and hosted build gates in one command.

## Build Path Policy

- Hosted web validation uses webpack.
- `pnpm build` resolves to `node scripts/run-build.mjs`, which now calls `next build --webpack`.
- `pnpm build:web` also uses `next build --webpack`.
- `CAPACITOR_BUILD=true pnpm build` is the canonical mobile shell generation path.
- Turbopack is not the release baseline for this repository today.

## Current Known Warnings

- Next 16 deprecation warning for `middleware.ts`:
  document and track it, but do not treat it as an emergency release rewrite. Migration to `proxy` remains a planned platform task.
- pnpm ignored build scripts:
  `supabase` is now explicitly allowed via `pnpm.onlyBuiltDependencies`.
- Mobile runtime warnings:
  broader rollout still requires explicit support/privacy contacts and, ideally, fallback runtime hosts.

## External Inputs Still Required

- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- active `STRIPE_PRICE_*` envs
- `SUPPORT_EMAIL`
- `PRIVACY_EMAIL`
- `CAPACITOR_SERVER_URL` if it differs from `NEXT_PUBLIC_APP_URL`
- `CAPACITOR_FALLBACK_URLS` when single-host mode is not acceptable
- official HTTPS host for final go-live validation

## Billing And Mobile Checks Before Controlled Commercial Release

- confirm the official host returns `/api/mobile/runtime`, `/api/health`, `/review-access`, `/politica-privacidade`, `/termos-de-uso`, and `/excluir-conta`
- confirm Stripe release validation is green in the target environment
- confirm reviewer/login flow works on the official host
- confirm native sync uses `mobile-build/`, not `out/`

## Release Decision Policy

- Closed pilot and controlled rollout: allowed when the pipeline above is green and remaining gaps are only external configuration.
- Broad commercial rollout: blocked until official host, Stripe live config, and operational contacts are fully closed.
