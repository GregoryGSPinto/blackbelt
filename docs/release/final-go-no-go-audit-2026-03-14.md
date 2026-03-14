# BlackBelt Final Go/No-Go Audit

Date: 2026-03-14
Decision: GO para piloto fechado

## Executive Summary

BlackBelt is not ready for broad commercial release. The core product flows are materially stronger than before and the main academy/admin/professor/student journeys are now usable, but the repository still contains a legacy authorization and pricing/billing surface based on `usuarios_academia` that coexists with the current `memberships` domain. That is the main blocker against controlled commercial launch.

The current state is acceptable for a closely monitored pilot with a very small number of academies, direct operational support, controlled billing expectations, and no assumption of large-scale tenant growth.

## Release Board Status

- Core product flow: pass with risk
- Auth and authorization: pass with risk
- Multi-tenancy isolation: fail for commercial release, pass with risk for pilot
- Schema/domain consistency: pass with risk
- UX/commercial polish: pass with risk
- QA/build confidence: pass with risk
- Mobile readiness: pass with risk

## Main Blockers

1. Legacy multi-tenant model still active in billing and commercial modules.
   - Affected areas include subscription, addons, usage, pricing update, billing forecast, and super-admin APIs.
   - These still read `usuarios_academia` instead of the current `memberships` model.

2. Release validation is not clean on the default build path.
   - `npx next build --no-lint` is not supported by the installed Next.js version.
   - `npx next build` still panics under Turbopack in this environment.
   - `npx next build --webpack` succeeds and is the effective validation path today.

3. Mobile operational metadata is incomplete.
   - `SUPPORT_EMAIL` and `PRIVACY_EMAIL` are not configured.
   - No fallback runtime URLs are configured for hosted Capacitor runtime.

## Pilot Constraints

- Limit the pilot to a small number of academies.
- Keep close manual monitoring over auth, onboarding, billing, and tenant boundaries.
- Avoid claiming hardened commercial billing maturity until the legacy `usuarios_academia` path is retired.
- Treat mobile as controlled rollout only, not broad Play Store scale distribution.

## Required Before Commercial Launch

1. Migrate remaining legacy APIs and pricing/billing paths from `usuarios_academia` to `memberships`.
2. Eliminate dual-domain tenant enforcement in schema, RLS, and API authorization.
3. Stabilize the default Next build path and remove dependency on webpack fallback.
4. Configure support/privacy operational contacts and mobile fallback hosts.
5. Add integration coverage for real tenant isolation, academy creation, billing, and role enforcement.
