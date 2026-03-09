# BlackBelt

BlackBelt is a multi-role platform for martial arts academies built on Next.js, Supabase, and a large mock-first service layer. The repository currently contains the web app, mobile build assets, Supabase migrations, backend infrastructure experiments, and a broad automated test suite in a single monorepo-style workspace.

This repository builds and tests successfully as of March 9, 2026, but it is not yet a cleanly separated enterprise codebase. The documentation in this cleanup pass reflects the actual state of the project rather than an idealized target.

## Overview

- Frontend: Next.js App Router application under `app/`, `components/`, `contexts/`, `hooks/`, and `features/`
- Shared/domain code: `lib/` and `src/`
- Backend infrastructure experiments: `server/`
- Database and edge functions: `supabase/`
- Tests: `tests/`
- Native/mobile artifacts: `android/`, `ios/`, `resources/`, `store/`

## Architecture

The codebase is organized around route groups and shared libraries, but it is not fully modularized by domain yet.

- `app/`: UI routes and API routes
- `components/`: shared and role-specific React components
- `lib/api/`: service layer used by the frontend and tests
- `lib/domain/`, `lib/application/`, `lib/security/`, `lib/persistence/`: domain, application, and infrastructure concerns
- `src/features/`: newer feature-oriented modules
- `supabase/migrations/`: SQL schema, RLS, billing, and feature migrations

See [ARCHITECTURE.md](/Users/user_pc/Projetos/BlackBelt/ARCHITECTURE.md) for the current-state architecture and the target cleanup direction.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Supabase
- Vitest + Testing Library
- Tailwind CSS
- Capacitor
- Stripe
- Sentry

## Installation

Requirements:

- Node.js 18.17+ or newer
- pnpm 9+ or newer

Install dependencies:

```bash
pnpm install
```

Local development:

```bash
pnpm dev
```

Production build:

```bash
pnpm build
pnpm start
```

Native/mobile build:

```bash
CAPACITOR_BUILD=true pnpm build
bash scripts/capacitor-setup.sh
```

## Environment

The app supports mock-first development and partial Supabase-backed execution.

Common variables:

- `NEXT_PUBLIC_USE_MOCK`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_DSN`

## Development Workflow

Primary checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Database helpers:

```bash
pnpm db:up
pnpm db:migrate
pnpm db:down
```

## Repository Notes

- `mobile-build/` and `logs/` are generated/output-oriented directories and should not receive new committed artifacts.
- The repo currently mixes legacy folders (`hooks/`, `features/`) with newer modules (`src/features/`) and broad shared libraries (`lib/`).
- Some services are still mock-backed or placeholder-backed by design.

## Documentation

- [ARCHITECTURE.md](/Users/user_pc/Projetos/BlackBelt/ARCHITECTURE.md)
- [CONTRIBUTING.md](/Users/user_pc/Projetos/BlackBelt/CONTRIBUTING.md)
- [CHANGELOG.md](/Users/user_pc/Projetos/BlackBelt/CHANGELOG.md)
- [docs/REPOSITORY_DIAGNOSTIC.md](/Users/user_pc/Projetos/BlackBelt/docs/REPOSITORY_DIAGNOSTIC.md)
