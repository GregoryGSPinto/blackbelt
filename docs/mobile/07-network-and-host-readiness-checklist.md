# Network And Host Readiness Checklist

Date: March 12, 2026

## Configuration gate

- `NEXT_PUBLIC_APP_URL` is set
- `NEXT_PUBLIC_APP_URL` uses `https://`
- `NEXT_PUBLIC_APP_URL` is a professional domain
- `CAPACITOR_SERVER_URL` is either unset or matches the intended release host
- `CAPACITOR_FALLBACK_URLS` is either empty by design or points only to approved production-grade domains
- `SUPPORT_EMAIL` is set
- `PRIVACY_EMAIL` is set

## Reachability gate

- DNS resolves the primary host from a mobile network
- HTTPS certificate is valid
- redirect chain is short and deterministic
- no redirect lands on temporary, preview, or staging domains

## App boot gate

- `GET /api/mobile/runtime` returns `200`
- `GET /api/health` returns `200`
- app opens from the shell without hanging longer than 7 seconds
- when the host is unavailable, the shell shows a friendly error and retry action
- browser fallback button opens the hosted app URL

## Reviewer gate

- `/review-access` loads
- reviewer credentials are valid in the deployed environment
- `/politica-privacidade` loads
- `/termos-de-uso` loads
- `/excluir-conta` loads

## Auth gate

- login succeeds on first attempt
- session persists after reload
- logout clears session
- no redirect loop happens between login and protected routes

## Acceptance rule

The host is `READY` only if all items above pass from a real external network, not just from local build validation.
