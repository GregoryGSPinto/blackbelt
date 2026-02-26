# BlackBelt — Setup Guide

## Prerequisites

- Node.js >= 18.17.0
- pnpm >= 9.0.0
- Supabase CLI (`pnpm supabase`)

## Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the Supabase variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. Keep `NEXT_PUBLIC_USE_MOCK=true` for development without a Supabase instance.

## Running Locally

### Mock Mode (no backend required)
```bash
pnpm dev
```
The app runs entirely on mock data. No Supabase connection needed.

### With Supabase Backend

1. Start local Supabase:
   ```bash
   pnpm supabase start
   ```

2. Run migrations:
   ```bash
   pnpm supabase db reset
   ```
   This applies all migrations from `supabase/migrations/` and runs `supabase/seed.sql`.

3. Update `.env.local` with local Supabase credentials (printed by `supabase start`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
   SUPABASE_SERVICE_ROLE_KEY=<from supabase start output>
   NEXT_PUBLIC_USE_MOCK=false
   ```

4. Start the dev server:
   ```bash
   pnpm dev
   ```

## Switching from Mock to Real Backend

Set in `.env.local`:
```
NEXT_PUBLIC_USE_MOCK=false
```

The app uses dual-mode architecture:
- **Mock mode** (`true`): Auth via localStorage, data from mock services
- **Real mode** (`false`): Auth via Supabase Auth, data from Supabase database

All existing interfaces (`useAuth()`, `useNotifications()`) remain unchanged.

## Running Migrations

Migrations are in `supabase/migrations/` and run in order:

| File | Description |
|------|-------------|
| `00001_foundation.sql` | Core tables (academies, profiles, memberships) |
| `00002_classes_attendance.sql` | Classes, sessions, enrollments, attendance |
| `00003_progression.sql` | Belt systems, promotions, skills, milestones |
| `00004_rls_policies.sql` | Advanced RLS helper functions and policies |
| `00005_event_store.sql` | Domain events, snapshots, subscriptions |
| `00006_financial.sql` | Plans, subscriptions, invoices, payments |
| `00007_gamification.sql` | Points, streaks, achievements, leaderboard |
| `00008_notifications.sql` | Realtime notifications with helper functions |
| `00009_lgpd.sql` | LGPD compliance (consent, export, anonymization) |
| `00010_audit_monitoring.sql` | Audit log, rate limiting, auto-audit triggers |

To apply all migrations:
```bash
pnpm supabase db reset
```

To create a new migration:
```bash
pnpm supabase migration new <name>
```

## Project Structure

```
supabase/
  config.toml              # Supabase local dev config
  seed.sql                 # Seed data
  migrations/              # 10 SQL migration files
  functions/
    health-check/          # Edge function for health monitoring

lib/supabase/
  client.ts                # Browser client (createBrowserClient)
  server.ts                # Server client (uses cookies)
  admin.ts                 # Service role client (bypasses RLS)
  middleware.ts            # Session refresh for Next.js middleware
  storage.ts               # File upload helpers (avatars, documents, media)
  types.ts                 # Database types

lib/db/queries/            # Query functions (receive SupabaseClient)
  academies.ts
  memberships.ts
  classes.ts
  attendance.ts
  progression.ts
  financial.ts
  gamification.ts

app/actions/               # Server actions ('use server')
  academy.ts
  members.ts
  classes.ts
  checkin.ts
  progression.ts
  lgpd.ts

lib/event-store/           # Event sourcing infrastructure
  event-types.ts           # Event type registry
  event-store.ts           # Append/query events and snapshots
  projector-runner.ts      # Process events and update read models

lib/monitoring/
  supabase-monitor.ts      # Health checks, table stats, audit queries

hooks/
  useRequireAuth.ts        # Redirect if not authenticated
  useRequireRole.ts        # Redirect if insufficient role
  useRealtimeNotifications.ts  # Supabase Realtime subscription
  useFileUpload.ts         # File upload with progress tracking
```

## Type Checking

```bash
pnpm typecheck
```

Note: Pre-existing type errors in `lib/domain/events/` and `app/(professor)/` are unrelated to the Supabase backend.
