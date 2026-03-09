# Database Backup Strategy

## Objective

Protect production billing, academy, and member data before any schema change or operational incident.

## Policy

- Daily full backup
- 7 day retention minimum
- Snapshot immediately before every production migration
- Restore drill at least once per month

## Minimum Procedure

1. Create a snapshot before `supabase db push` in production.
2. Record snapshot identifier in the release ticket.
3. Apply migrations only after snapshot confirmation.
4. Keep the last 7 daily backups available for restore.
5. If a billing or subscription migration is involved, validate restore on a staging copy first.

## Recovery Targets

- RPO: 24 hours maximum
- RTO: 4 hours target for core platform recovery

## Critical Tables

- `profiles`
- `academies`
- `memberships`
- `academy_subscriptions`
- `subscription_invoices`
- `payments`
- `attendances`

## Release Checklist

- Backup completed
- Snapshot id recorded
- Migration dry-run reviewed
- Rollback owner assigned
- Restore command validated
