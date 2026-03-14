# Architecture

## Product Architecture Reality

BlackBelt is a large Next.js application with supporting platform code, Supabase schema, mobile shell assets, and operational scripts in the same repository.

The long-term ambition is still valid: a premium operating system for martial arts academies. The current codebase, however, should be read as a strong pilot/commercial-foundation repo rather than a fully separated enterprise platform.

## What Is Canonical Today

### Implemented

- Primary domain: `academies + profiles + memberships`
- Tenant and role enforcement for critical academy-scoped flows
- Supabase-backed API routes, RLS policies, and server auth helpers
- Stripe integration centered on `academy_subscriptions` and `subscription_invoices`
- Hosted Capacitor shell for mobile distribution

### Stable In Pilot

- Academy-level admin/professor/student flows
- Controlled onboarding and academy operations
- Controlled commercial billing paths once live envs are provided
- Mobile runtime for assisted distribution

### Depends On External Configuration

- Final hosted origin used by the mobile shell
- Stripe live keys, webhook secret, and plan price envs
- Support/privacy operational contacts
- App Review / store-console business identity and reviewer credentials

### Planned

- Clearer feature-module boundaries
- Less duplication across API handlers
- Reduced mock-first ambiguity in non-core surfaces
- CI artifact publishing instead of committed generated outputs

## Current Repository Layers

- Presentation: `app/`, `components/`, `contexts/`, `hooks/`
- Shared frontend/service code: `lib/api/`, `lib/`, `src/shared/`
- Domain and application logic: `lib/domain/`, `lib/application/`
- Security/platform/integrations: `lib/security/`, `lib/supabase/`, `lib/payments/`, `lib/notifications/`
- Incremental feature modules: `src/features/`
- Backend infrastructure experiments: `server/`
- Database schema and functions: `supabase/`

## Architectural Strengths

- The commercial domain now converges on `memberships` as the operational source of truth for tenant and role in critical paths.
- The codebase has meaningful validation depth: typecheck, lint, tests, and stable webpack production build.
- Mobile packaging is no longer tied to a broken static-export assumption.
- Billing structure is materially stronger than earlier audits, even though live Stripe execution still depends on external secrets.

## Architectural Risks Still Present

- The repo still mixes legacy and newer module layouts (`features/`, `src/features/`, `hooks/`, broad `lib/`).
- Some product surfaces outside the core academy flows remain partially mock-backed or only locally stateful.
- Documentation history in the repo is broader than the live state and needs careful interpretation.
- Generated and operational artifacts still coexist with source in the same workspace.

## Cleanup Direction

1. Preserve `memberships` as the only operational tenant source in every new route and service.
2. Continue reducing mock-backed ambiguity in super-admin, parent, and secondary operational surfaces.
3. Standardize on clearer domain/module boundaries without breaking the working import graph.
4. Move generated artifacts and release evidence toward CI outputs instead of repository state.
5. Keep release documentation tied to validated commands and externally provable operational dependencies.
