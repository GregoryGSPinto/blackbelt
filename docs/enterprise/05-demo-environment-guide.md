# Demo Environment Guide

Date: March 12, 2026

## Recommended commercial position

Use a controlled hosted demo environment, not production customer data, for reviewer and enterprise demonstrations.

## Required configuration

- `NEXT_PUBLIC_USE_MOCK=true`
- `NEXT_PUBLIC_APP_URL=https://<demo-host>`
- optional native override: `CAPACITOR_SERVER_URL=https://<demo-host>`

## Demo login

- URL: `/login`
- Help page: `/review-access`
- Reviewer account:
  - `<reviewer-email>`
  - `<reviewer-password>`

## Recommended walkthrough

1. Dashboard and academy overview
2. Student progress and check-in
3. Communications and alerts
4. Finance and plans
5. Privacy, terms, and account deletion

## What not to claim in sales

- Do not claim full offline-native operation.
- Do not claim native in-app billing readiness.
- Do not claim production-store approval until hosted review and legal fields are finalized.

## Operational guardrails

- Keep demo separate from production data
- rotate the hosted demo URL only with documentation update
- preserve `/review-access` as the single reviewer instruction endpoint
