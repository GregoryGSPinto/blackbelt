# Contributing

## Scope

This repository contains product code, migrations, mobile assets, and operational scripts. Treat changes as production-facing even when working in mock mode.

## Setup

```bash
pnpm install
pnpm dev
```

## Required Checks

Run before opening a PR:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Coding Standards

- Keep route files thin when possible.
- Prefer typed DTOs and schemas over `any`.
- Reuse existing service and utility layers before adding new helpers.
- Avoid committing generated outputs or local logs.
- Preserve mock-mode behavior unless the change explicitly targets backend integration.

## Repository Conventions

- `app/` is for route entrypoints and route-local components.
- `components/` is for reusable UI that is still shared by multiple routes.
- `src/features/` is preferred for new domain-oriented frontend modules.
- `lib/` is for domain, infrastructure, integrations, and shared services.
- `supabase/migrations/` must remain append-only in normal development.

## Pull Requests

Each PR should include:

- a short problem statement
- the behavioral impact
- validation results
- any environment or migration requirements

## High-Risk Areas

Use extra caution in:

- authentication flows
- payments and billing
- security middleware
- Supabase RLS-sensitive queries
- large route pages with many local states
