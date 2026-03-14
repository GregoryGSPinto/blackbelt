# Architecture

## Platform Identity

BlackBelt is a premium operating system for martial arts academies. It manages the complete lifecycle of an academy: tenancy, membership, billing, pedagogy, attendance, progression, communication, and mobile access — all anchored on a single domain model.

The platform is built as a monolithic Next.js application backed by Supabase (auth, database, RLS) and Stripe (billing). Mobile distribution uses a hosted Capacitor shell. The codebase is structured for a controlled commercial pilot today and architectural evolution over time.

## Platform Spine

Every operational decision in BlackBelt flows from three tables:

| Table | Role |
|-------|------|
| `academies` | Tenant boundary. Every data partition derives from an academy. |
| `profiles` | Identity. One profile per person, shared across academies. |
| `memberships` | Operational source of truth. Binds a profile to an academy with a role and status. |

**Membership is the pivot.** Tenant resolution, role enforcement, billing scope, and data access all derive from `membership.academy_id` and `membership.role`. This is the platform's architectural invariant.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS |
| Auth | Supabase Auth, httpOnly cookies, in-memory tokens |
| Database | Supabase (PostgreSQL), RLS policies |
| Billing | Stripe (checkout, webhooks, portal), `academy_subscriptions` table |
| Mobile | Capacitor 8 (iOS/Android), hosted shell via `mobile-build/` |
| Validation | Zod schemas, server-side rate limiting, CSRF protection |
| Monitoring | Structured JSON logger, Sentry, OpenTelemetry |
| Testing | Vitest, 615+ tests, jsdom environment |

## Repository Layers

```
app/              → Pages and API routes (Next.js App Router)
components/       → React UI components
contexts/         → React Context providers
hooks/            → Custom React hooks
lib/api/          → API services and client
lib/security/     → Auth, RBAC, audit, sensitive data handling
lib/payments/     → Stripe integration (checkout, webhook, plan mapping)
lib/supabase/     → Supabase client helpers (server, admin, browser)
lib/monitoring/   → Structured logger and route observability
lib/subscription/ → Billing domain (trial, plans, quotas)
src/features/     → Incremental feature modules
supabase/         → Database schema, migrations, edge functions
scripts/          → Build, validation, and operational scripts
tests/            → Automated test suites
```

## Security Architecture

- **Session transport:** httpOnly cookies (Supabase session + custom `blackbelt_session`)
- **Token storage:** In-memory only. Never localStorage.
- **CSRF:** `X-Requested-With` header required for mutations on `/api/*`
- **Security headers:** HSTS, X-Frame-Options DENY, CSP, CORP, COOP
- **Sensitive data:** All structured logs pass through `redactSensitiveData()` before output
- **PII masking:** `maskEmail()`, `maskPhone()`, `maskDocument()`, `maskIpAddress()`
- **Rate limiting:** Server-side sliding window per key (`lib/api/rate-limit.ts`)
- **Access control:** `withAuth()`, `withBillingManagerAccess()`, `withSuperAdminAccess()`

## Maturity Status

| Domain | Status |
|--------|--------|
| Core academy domain (tenancy, membership, roles) | Production-grade |
| Admin / professor / student core journeys | Pilot-stable |
| Billing structure (trial, checkout, webhook, persistence) | Production-grade |
| Stripe live execution | Depends on external configuration |
| Mobile packaging and runtime | Production-grade |
| Mobile distribution | Depends on external configuration |
| Parent, kids, teen, super-admin surfaces | Implemented, not fully hardened |
| Module boundaries and code organization | Evolving |

## Architectural Invariants

These rules govern all future development:

1. **Membership is the tenant pivot.** Every route that touches academy-scoped data must derive tenant from `membership.academy_id`.
2. **Billing lives in `academy_subscriptions`.** Never use legacy `subscriptions` or `invoices` tables.
3. **No tokens in localStorage.** Session transport is httpOnly cookies; access tokens are in-memory.
4. **Errors never leak PII.** All error payloads use generic messages; logs pass through sanitization.
5. **Mock mode is explicit.** Services check `useMock()` at the boundary; real flows never silently fall back to mock data.
6. **Mobile uses hosted shell.** Capacitor consumes `mobile-build/`, never `out/` or static export.

## Evolution Direction

1. Strengthen module boundaries without breaking the working import graph.
2. Reduce mock-backed ambiguity in secondary surfaces as backend implementations mature.
3. Move generated artifacts toward CI outputs instead of repository state.
4. Maintain release documentation tied to validated commands and externally provable dependencies.
