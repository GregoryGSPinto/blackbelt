# Repository Diagnostic

Date: 2026-03-09

## Executive Summary

The repository is functional and validates successfully with tests and build, but it is not yet organized as a clean enterprise-grade codebase. The main issues are structural sprawl, oversized route files, inconsistent module boundaries, widespread `any` usage in API and ACL code, and generated artifacts committed alongside source.

## Findings

### Architecture

- Multiple competing module roots exist: `features/`, `src/features/`, `hooks/`, and `lib/hooks/`.
- `app/api/` contains a large number of routes with repeated query and mapping patterns.
- Infrastructure, product code, mobile assets, logs, and historical docs all live in one workspace without stronger boundaries.

### Duplication

- API and Supabase mapping logic is repeated across many routes.
- `src/shared/api/createSecureHandler.ts` is only a re-export shim for `lib/api/createSecureHandler.ts`, which indicates boundary drift.
- Shared concepts such as service contracts, mock implementations, and route response shaping are spread across several folders.

### Dead Code and Output Noise

- Generated directories such as `mobile-build/` and operational `logs/` are tracked in the repo.
- Some documentation and historical audit files are archival rather than active engineering documentation.
- There are placeholder and mock-backed services that intentionally return stubbed data until backend work lands.

### Large Components and Files

Largest source files identified in the scan include:

- `app/(auth)/login/page.tsx` at 2348 lines
- `lib/api/contracts.ts` at 1779 lines
- `lib/subscription/services.ts` at 1066 lines
- `components/shared/KidsGatekeeper.tsx` at 930 lines

These files are difficult to review, test, and reason about in an enterprise workflow.

### Naming and Structure Inconsistencies

- Mixed Portuguese and English naming is common across routes, services, and docs.
- Some folders use role-based names, some use domain names, and some use technical-layer names.
- README claims and actual repository layout were out of sync before this cleanup.

### Performance

- Very large page components likely trigger unnecessary rerenders and complicate memoization strategy.
- Broad client-side route/page modules reduce the opportunity for server-only boundaries.
- The repository includes a very large number of routes and imports, which increases build and maintenance complexity.

### Security

- Many API routes still rely on loose response typing and `any` casts around Supabase results.
- Placeholder contact and legal content remains in some source files.
- Several TODOs indicate incomplete backend-grade implementations for MFA, audit persistence, storage, and push integrations.

### Tests and Validation

Validation at the time of this report:

- `pnpm typecheck`: pass
- `pnpm test`: pass
- `pnpm build`: pass
- `pnpm lint`: failed before cleanup due to an unused import in `components/shell/ShellMobileDrawer.tsx`

## Recommended Next Refactors

1. Standardize new frontend work under `src/features/` and `src/shared/`.
2. Break the login page and other oversized routes into route shell plus local modules.
3. Introduce typed Supabase query adapters to shrink `any` usage in API routes and ACL mappers.
4. Move generated artifacts and logs fully out of version control.
5. Replace placeholder operational/legal data before production review.
