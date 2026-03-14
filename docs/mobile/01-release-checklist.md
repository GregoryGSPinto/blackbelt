# Mobile Release Checklist

## Validation Gates

- [ ] `pnpm install`
- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `npx next build --webpack`
- [ ] `pnpm mobile:runtime:check`
- [ ] `CAPACITOR_BUILD=true pnpm build`
- [ ] `pnpm mobile:sync:ios`
- [ ] `pnpm mobile:sync:android`

## Required Runtime Configuration

- [ ] `NEXT_PUBLIC_APP_URL` or `CAPACITOR_SERVER_URL` points to the official HTTPS host
- [ ] `SUPPORT_EMAIL` is explicit and monitored
- [ ] `PRIVACY_EMAIL` is explicit
- [ ] `CAPACITOR_FALLBACK_URLS` is either configured or consciously waived for controlled rollout

## Billing And Commercial Dependencies

- [ ] `STRIPE_SECRET_KEY` configured in the release environment
- [ ] `STRIPE_WEBHOOK_SECRET` configured in the release environment
- [ ] active `STRIPE_PRICE_*` envs mapped to the intended plans
- [ ] `pnpm exec tsx scripts/validate-stripe-release.ts` reviewed before rollout

## Hosted-Origin Checks

- [ ] `/api/mobile/runtime` returns 200 on the official host
- [ ] `/api/health` returns 200 on the official host
- [ ] `/review-access` is reachable on the official host
- [ ] `/politica-privacidade`, `/termos-de-uso`, and `/excluir-conta` are reachable on the official host
- [ ] reviewer login/logout works on the official host

## Native Packaging

- [ ] Android signing is configured
- [ ] iOS signing/team configuration is configured
- [ ] release host is not a preview or temporary domain

## Current Release Interpretation

- Controlled distribution: possible when all validation gates pass and the external host/env items above are closed.
- Broad store rollout: still blocked until official host, legal/reviewer inputs, and operational contacts are fully in place.
