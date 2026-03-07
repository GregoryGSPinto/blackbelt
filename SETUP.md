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

## Seeding Demo Data

After running migrations, you can populate the database with demo data:

### Option 1: Complete Demo Environment (Recommended)

```bash
# 1. Make sure Supabase is running and migrations are applied
pnpm supabase db reset

# 2. Seed all demo data (users, classes, enrollments)
npx tsx scripts/seed-all-demo.ts
```

### Option 2: Individual Scripts

```bash
# Seed demo users only (9 demo accounts)
npx tsx scripts/seed-demo-users.ts

# Seed demo classes only
npx tsx scripts/seed-demo-classes.ts

# Legacy: Create basic test users (3 accounts)
npx tsx scripts/create-test-user.ts
```

### Demo Users Available

| Email | Password | Role | Profile |
|-------|----------|------|---------|
| `admin@blackbelt.com` | `blackbelt123` | 👔 Admin | Carlos Administrador |
| `professor@blackbelt.com` | `blackbelt123` | 🥋 Professor | Prof. Ricardo Mendes |
| `adulto@blackbelt.com` | `blackbelt123` | 🎓 Aluno Adulto | Carlos Silva |
| `miguel@blackbelt.com` | `blackbelt123` | 🎓 Aluno Teen | Miguel Oliveira (15) |
| `beatriz@blackbelt.com` | `blackbelt123` | 🎓 Aluno Teen | Beatriz Oliveira (14) |
| `kid@blackbelt.com` | `blackbelt123` | 🎓 Aluno Kids | Pedro Ferreira (8) |
| `sofia@blackbelt.com` | `blackbelt123` | 🎓 Aluno Kids | Sofia Ferreira (6) |
| `paiteen@blackbelt.com` | `blackbelt123` | 👨‍👩‍👧 Responsável | Roberto Oliveira (pai) |
| `paikids@blackbelt.com` | `blackbelt123` | 👨‍👩‍👧 Responsável | Ana Ferreira (mãe) |
| `superadmin@blackbelt.com` | `blackbelt123` | 👨‍💼 Super Admin | Super Admin BlackBelt |

**Families:**
- **Família Oliveira**: Roberto (pai) + Miguel (15) + Beatriz (14)
- **Família Ferreira**: Ana (mãe) + Pedro (8) + Sofia (6)

### What Gets Created

The complete seed includes:

1. **Academy**: "Academia BlackBelt Demo" with full settings
2. **Users**: 9 demo user accounts with profiles
3. **Memberships**: Role-based memberships (student, professor, admin, parent)
4. **Families**: Parent-child links for family features
5. **Belt Systems**: BJJ, Judo, Muay Thai, Karate
6. **Achievements**: Attendance, streak, belt, and social achievements
7. **Class Schedules**: 15+ recurring classes (BJJ, Muay Thai, Kids, Teen)
8. **Plans**: Starter, Professional, Enterprise subscription plans
9. **Shop**: Products and categories
10. **Videos**: Video series and content
11. **Events**: Upcoming seminars and competitions
12. **CRM**: Sample leads for testing

### Reset Demo Data

To completely reset the demo environment:

```bash
# Reset database (applies migrations + seed.sql)
pnpm supabase db reset

# Re-create all demo data
npx tsx scripts/seed-all-demo.ts
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
