# BlackBelt

BlackBelt is a premium operational platform for martial arts academies. The product vision remains broad: academy operations, member experience, pedagogy, billing, communication, mobile distribution, and AI-assisted workflows around a single academy domain.

This repository reflects the real current state of that vision as of March 14, 2026. It is not a claim that every surface is production-complete.

## Current Product Reality

### Implemented

- Core domain centered on `academies + profiles + memberships`
- Multi-role web application built on Next.js App Router
- Supabase-backed schema, auth helpers, RLS, and migrations
- Core academy/admin/professor/student journeys
- Trial, subscription, Stripe checkout/webhook structure
- Hosted Capacitor shell and mobile runtime endpoint
- Broad automated test suite plus production build validation

### Stable In Pilot

- Closed paid pilot with direct operational support
- Controlled academy onboarding and tenancy-scoped operations
- Billing structure for controlled commercial rollout, once live configuration is provided
- Controlled mobile distribution where the hosted runtime is explicitly validated

### Technically Resolved

- Critical tenancy surfaces now derive tenant from `membership.academy_id`
- Billing-critical routes no longer depend on the old `usuarios_academia` contract
- Stripe persistence is aligned to `academy_subscriptions` and `subscription_invoices`
- Mobile packaging uses `mobile-build/`, not static export in `out/`

### Depends On External Configuration

- Final hosted HTTPS domain
- Stripe live secrets, webhook secret, and `STRIPE_PRICE_*` envs
- `SUPPORT_EMAIL` and `PRIVACY_EMAIL`
- `CAPACITOR_FALLBACK_URLS` if single-host mode is not acceptable
- App Store / Play Console business identity and reviewer credentials

### Planned

- Broad commercial rollout without assisted monitoring
- Public store production readiness beyond controlled distribution
- Full de-risking of still mock-backed or partially implemented non-core surfaces
- Deeper architectural cleanup and stronger module boundaries

## Repository Overview

- Frontend: `app/`, `components/`, `contexts/`, `hooks/`, `features/`
- Shared/domain code: `lib/`, `src/`
- Backend infrastructure experiments: `server/`
- Database and edge functions: `supabase/`
- Tests: `tests/`
- Native/mobile artifacts: `android/`, `ios/`, `resources/`, `store/`

## Build And Validation

Requirements:

- Node.js >=20.19.0
- pnpm 10.31.x

Install:

```bash
pnpm install
```

Local development:

```bash
pnpm dev
```

Primary validation path used today:

```bash
pnpm typecheck
pnpm lint
pnpm test
npx next build --webpack
```

Mobile/runtime validation:

```bash
pnpm mobile:runtime:check
pnpm mobile:build:web
pnpm mobile:sync
```

Notes:

- `npx next build --webpack` is the stable release validation path in this workspace.
- `pnpm build` is a wrapper that executes the same webpack path and optionally generates the Capacitor shell when `CAPACITOR_BUILD=true`.
- `CAPACITOR_BUILD=true pnpm build` generates the hosted Capacitor shell into `mobile-build/`.
- Capacitor consumes only `mobile-build/`.

## Environment

Common variables:

- `NEXT_PUBLIC_USE_MOCK`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_DSN`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — Platform identity, spine, and invariants
- [BBOS_READINESS_REPORT.md](BBOS_READINESS_REPORT.md) — Commercial readiness assessment
- [FINAL_STORE_READINESS_REPORT.md](FINAL_STORE_READINESS_REPORT.md) — Store submission readiness
- [docs/ops/01-release-runbook.md](docs/ops/01-release-runbook.md) — Release pipeline
- [docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md) — Stripe production configuration
- [docs/final/](docs/final/) — Go/no-go decisions and blockers
- [docs/history/](docs/history/) — Historical reports and audits
