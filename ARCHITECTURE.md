# Architecture

## Current State

BlackBelt is a large Next.js application with supporting infrastructure code in the same repository.

Core layers:

- Presentation: `app/`, `components/`, `contexts/`, `hooks/`
- Frontend services: `lib/api/`
- Domain and application code: `lib/domain/`, `lib/application/`
- Data access and persistence helpers: `lib/db/`, `lib/persistence/`, `lib/read-models/`
- Security and platform concerns: `lib/security/`, `lib/supabase/`, `lib/payments/`, `lib/notifications/`
- Incremental feature modules: `src/features/`
- Backend infrastructure experiments: `server/`
- Database schema and functions: `supabase/`

## Current Structural Risks

- The repo contains both legacy and newer module layouts (`features/`, `src/features/`, `hooks/`, `lib/hooks/`).
- `app/api/` contains many routes with duplicated Supabase query and mapping patterns.
- Some route pages are excessively large, especially authentication and admin pages.
- Generated and operational artifacts are committed alongside source (`mobile-build/`, `logs/`).
- The service layer is partially mock-first and partially real, which is useful for development but blurs production boundaries.

## Enterprise Target

The target structure should move toward stable domain boundaries without breaking route imports:

- `app/`: route entrypoints only
- `src/features/<domain>/`: UI, hooks, service orchestration, schemas, tests
- `src/shared/`: cross-domain UI and utilities
- `lib/domain/`: pure domain logic
- `lib/application/`: orchestration, projectors, subscribers, use cases
- `lib/infrastructure/`: Supabase, payments, notifications, storage, external integrations

## Cleanup Direction

Recommended order for deeper follow-up work:

1. Consolidate duplicate frontend module roots by standardizing on `src/features/` and `src/shared/`.
2. Extract repeated API route patterns into typed handlers and typed Supabase query helpers.
3. Split oversized route files into route shell + local feature modules.
4. Move generated artifacts out of version control and publish them through CI artifacts instead.
5. Tighten types around Supabase responses to reduce `any` usage in API and ACL layers.

## Boundaries Preserved In This Cleanup

This pass does not perform a mass folder migration because the repository currently builds successfully against the existing import graph. The cleanup instead improves documentation, repository hygiene, and a small code issue while preserving runtime behavior.
