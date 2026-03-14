# Mobile Runtime Runbook

Date: March 12, 2026

## Purpose

Validate and operate the hosted runtime used by the Capacitor shell.

## Required configuration

- `NEXT_PUBLIC_APP_URL` or `CAPACITOR_SERVER_URL`: required, must be the canonical HTTPS host used by the released shell.
- `SUPPORT_EMAIL`: should be explicitly configured to a monitored inbox before any paid rollout.
- `PRIVACY_EMAIL`: should be explicitly configured; a dedicated privacy inbox is recommended before broader distribution.
- `CAPACITOR_FALLBACK_URLS`: optional for a controlled pilot, recommended before wider rollout to reduce single-host outage risk.

`pnpm mobile:runtime:check` now reports warnings when the runtime is still relying on default contact emails or when no fallback hosts are configured.

## Local preflight

Run:

```bash
pnpm mobile:runtime:check
pnpm build:mobile
npx cap sync ios
npx cap sync android
```

Treat any `WARN` output as an operational action item. For a controlled pilot, warnings are acceptable if they are understood and documented. For broader rollout, clear them first.

## External pre-release validation

1. Check DNS from a non-development network.
2. Check certificate validity in a browser.
3. Open:
   - `/api/mobile/runtime`
   - `/api/health`
   - `/review-access`
   - `/politica-privacidade`
   - `/termos-de-uso`
   - `/excluir-conta`
4. Login with the reviewer account in the hosted review environment.
5. Validate logout and relogin.

## Minimum publish checklist

- Confirm the mobile runtime endpoint returns the expected support and privacy contacts.
- Confirm `/suporte`, `/politica-privacidade`, `/termos-de-uso`, and `/excluir-conta` load on the public host.
- Confirm the release host is not depending on request-origin fallback.
- Confirm any single-host release decision is explicit and accepted for the current pilot scope.
- Confirm a monitored owner exists for the support inbox used in the runtime response.

## Incident response

If the hosted app becomes unavailable:

1. confirm DNS and TLS first
2. confirm `/api/mobile/runtime` and `/api/health`
3. if primary host is down and an approved fallback exists, update runtime configuration and regenerate `mobile-build`
4. resync native projects if the shell configuration changed
5. pause public submission until reviewer and legal paths are reachable again

## Release prohibition

Do not submit public store builds if any of these are true:

- runtime host uses a preview or temporary domain
- reviewer route is missing
- account deletion page is unavailable
- privacy or terms pages are unavailable
- login fails on the hosted origin
- the runtime still depends on request-origin host inference for public distribution
