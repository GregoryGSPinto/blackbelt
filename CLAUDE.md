# CLAUDE.md — BlackBelt Platform Guardrails

## What BlackBelt Is

A premium operational platform for martial arts academies. Single monorepo: Next.js 16 + Supabase + Stripe + Capacitor.

## Platform Spine (Source of Truth)

| Concept | Source of Truth | Never Use |
|---------|----------------|-----------|
| Tenant | `membership.academy_id` | Hard-coded academy IDs, `usuarios_academia` |
| Identity | `profiles.id` (= Supabase auth user ID) | Separate user tables |
| Role/Access | `membership.role` + `membership.status` | localStorage roles, URL-based role inference |
| Billing | `academy_subscriptions` + `subscription_invoices` | Legacy `subscriptions`, `invoices`, `payments` tables |
| Session | httpOnly cookies + in-memory access token | localStorage tokens |
| Mobile host | `CAPACITOR_SERVER_URL` or `NEXT_PUBLIC_APP_URL` | Static export in `out/` |

## Critical Route Patterns

Every new API route that touches academy-scoped data must:

1. Use `withAuth(request)` or `withBillingManagerAccess(request)` — always pass `request` for tenant header resolution.
2. Derive tenant from `membership.academy_id` — never from request body or URL params alone.
3. Use `apiServerError(error)` for catch blocks — never bare `console.error` + raw 500.
4. Use `logRouteEvent()` for business-critical operations (billing changes, trial events, auth events).
5. Use explicit field lists in Supabase `select()` — never `select('*')` which can leak internal columns.

## What Must Never Happen

- Tokens in localStorage
- `select('*')` on tables with sensitive columns (profiles, memberships)
- `console.error` with raw error objects in API routes (bypasses PII sanitization)
- Mock data returned when `NEXT_PUBLIC_USE_MOCK=false` without explicit opt-in
- Billing operations referencing legacy tables
- Routes without `request` parameter in `withAuth()` calls

## Build and Validation

```bash
pnpm typecheck          # TypeScript validation
pnpm lint               # ESLint
pnpm test               # Vitest (615+ tests)
npx next build --webpack # Production build
```

Full release gate: `pnpm build:release`

## Key Directories

- `lib/api/route-helpers.ts` — `withAuth()`, `apiOk()`, `apiServerError()`, `resolveMembershipSelection()`
- `lib/api/access-context.ts` — `withBillingManagerAccess()`, `withSuperAdminAccess()`
- `lib/security/sensitive-data.ts` — PII masking and redaction
- `lib/monitoring/route-observability.ts` — `logRouteEvent()` for structured operational events
- `lib/monitoring/structured-logger.ts` — Category-based structured logger
- `lib/payments/stripe-webhook.ts` — Webhook event processing
- `lib/payments/stripe-checkout.ts` — Checkout session and portal creation
- `lib/payments/stripe-plan-mapping.ts` — `STRIPE_PRICE_*` env resolution

## Mock Mode Rules

- `useMock()` from `lib/env.ts` controls mock behavior at the service boundary.
- Core API routes (auth, me, trial, subscription, webhook, academies, members, checkin) use Supabase directly — no mock dependency.
- Client-side services in `lib/api/*.service.ts` may have mock branches for non-core surfaces.
- When `NEXT_PUBLIC_USE_MOCK=false`, the system must never silently return mock data.

## Commit Style

```
<type>: <what changed>
```

Types: `fix`, `feat`, `security`, `ops`, `product`, `docs`, `chore`, `test`, `refactor`
