# Domain Model

## Core Areas

- Membership and profiles
- Attendance and check-in
- Progression and graduations
- Billing, subscriptions, and usage
- Communications and notifications
- Leads and academy operations

## Modeling Notes

Pure domain logic is concentrated in `lib/domain/`, while DTO-heavy frontend contracts currently live in `src/infrastructure/api/contracts/legacy-contracts.ts`. The target state is smaller, domain-oriented DTO modules with typed adapters around Supabase responses.
