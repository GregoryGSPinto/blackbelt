# Hosted Runtime Validation

Date: March 12, 2026

## Runtime map

- Primary runtime host source:
  - `CAPACITOR_SERVER_URL`
  - fallback to `NEXT_PUBLIC_APP_URL`
- Optional fallback hosts:
  - `CAPACITOR_FALLBACK_URLS`
- Final static shell directory:
  - `mobile-build/`
- Runtime bootstrap endpoint:
  - `/api/mobile/runtime`
- Runtime health endpoint:
  - `/api/health`
- Session endpoint:
  - `/api/auth/session`

## First-open critical dependencies

1. DNS must resolve the primary host.
2. TLS certificate must be valid for the primary host.
3. `/api/mobile/runtime` must return `200`.
4. `/api/health` must return `200`.
5. Hosted login route must render correctly.
6. Cookie-backed auth must work on the hosted origin.
7. Public compliance pages must be reachable:
   - `/review-access`
   - `/politica-privacidade`
   - `/termos-de-uso`
   - `/excluir-conta`

## App review risks of the hosted model

- Temporary hosts such as `*.vercel.app`, `*.trycloudflare.com`, `*.ngrok.io`, `localhost`, and similar domains are too fragile for public store submission.
- If the hosted app is unstable, the native shell will appear broken even when the package is technically valid.
- If login cookies fail on the hosted origin, reviewers will hit auth loops or broken sessions.
- If `/review-access` is missing in the deployed environment, reviewer instructions and actual behavior diverge.

## Hardening applied

- Added public bootstrap endpoint at `/api/mobile/runtime`
- Added shell-side validation of:
  - runtime endpoint
  - health endpoint
  - presence of review/compliance paths in runtime metadata
- Added support for fallback hosts
- Added host validation during shell generation
- Rejected ephemeral hosts by default in `scripts/build-mobile-shell.mjs`
- Added local runtime readiness validator via:

```bash
pnpm mobile:runtime:check
```

## Remaining risks

- External network validation still requires a human outside this workspace.
- No uptime SLA can be proven from repository state alone.
- No fallback host is currently configured.
- `SUPPORT_EMAIL` and `PRIVACY_EMAIL` are still unset in the checked config example.

## Hosted runtime decision

- Controlled runtime for TestFlight and Google Play internal testing: technically acceptable
- Public store runtime: blocked until hosted environment checks are completed externally
