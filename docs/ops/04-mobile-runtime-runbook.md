# Mobile Runtime Runbook

Date: March 12, 2026

## Purpose

Validate and operate the hosted runtime used by the Capacitor shell.

## Local preflight

Run:

```bash
pnpm mobile:runtime:check
pnpm build:mobile
npx cap sync ios
npx cap sync android
```

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
