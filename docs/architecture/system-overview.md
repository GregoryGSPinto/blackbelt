# System Overview

## Runtime Shape

BlackBelt is a Next.js App Router application with multi-role route groups in `app/`, shared frontend modules in `src/features/` and `src/shared/`, domain logic in `lib/domain/`, and infrastructure integrations split between `lib/` and the emerging `src/infrastructure/` layout.

## Layers

- `app/`: route entrypoints, server actions, API routes
- `src/features/`: feature-facing UI and page-level modules
- `src/shared/`: reusable components, hooks, and utilities
- `src/infrastructure/`: API contracts, subscription services, and future platform integrations
- `lib/domain/` and `lib/application/`: domain and orchestration logic
- `supabase/`: migrations, functions, and seeds

## Current Refactor Direction

The repository is being standardized around a `src/`-first layout with compatibility shims for existing imports. This allows route stability while gradually reducing coupling to legacy folder roots.
