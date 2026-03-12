# Review Account Strategy

Date: March 12, 2026

## Chosen strategy

Use a controlled reviewer build backed by mock mode plus a stable reviewer account and a public in-app guidance page.

## Implemented elements

- Public route: `/review-access`
- Login entry point from the main login screen when `NEXT_PUBLIC_USE_MOCK=true`
- Stable reviewer identity in mock auth seed:
  - reviewer email: provisioned by operations
  - reviewer password: provisioned by operations
- Guidance links for:
  - privacy policy
  - terms
  - public account deletion

## Why this strategy was chosen

- It avoids exposing real customer data.
- It removes hidden setup from review and demo.
- It is deterministic for QA and store review builds.
- It uses behavior already supported by the repository instead of inventing a separate secret path.

## Safe operating model

1. Build a dedicated hosted review environment.
2. Keep `NEXT_PUBLIC_USE_MOCK=true` in that environment.
3. Point `NEXT_PUBLIC_APP_URL` to that same hosted environment.
4. Use `/review-access` as the official reviewer instruction URL.

## Manual steps still required

- Deploy and smoke-test the hosted review environment.
- Confirm the reviewer account works in the deployed environment, not only locally.
- Provide the final support contact that will be submitted in App Store Connect and Play Console.

## Apple and Google reviewer instructions

- Start at `/login`
- If needed, open `/review-access`
- Login with the reviewer credentials supplied in the release packet
- Validate dashboard, communications, finance, settings, logout, privacy policy, terms, and account deletion

## Residual risk

Until the hosted review environment is externally verified, reviewer/demo readiness remains partially operational rather than fully proven.
