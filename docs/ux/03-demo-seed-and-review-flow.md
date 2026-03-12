# Demo Seed And Review Flow

Date: March 12, 2026

## Final flow

1. Reviewer opens `/login`
2. Reviewer can access `/review-access` if context is needed
3. Reviewer signs in with the stable mock reviewer account
4. Reviewer lands on admin-grade dashboard routes with demo-safe data
5. Reviewer can inspect privacy, terms, and account deletion without leaving the app

## Seed model

The repository already contains a mock auth seed with a dedicated reviewer identity. The flow depends on:

- `NEXT_PUBLIC_USE_MOCK=true`
- hosted environment configured for review/demo
- fake data only

## UX improvements applied

- reviewer entry point linked from login
- dedicated public review guidance page
- explicit deletion, privacy, and terms links in that page
- no dependency on hidden tenant setup for the basic evaluation journey

## Known dependency

The value demo depends on the hosted review environment using mock mode consistently across the deployed build.

## What still depends on backend or external setup

- public hosted review URL
- support mailbox actually monitored by the company
- final enterprise demo tenant if the team decides to move from mock mode to a real sandbox tenant
