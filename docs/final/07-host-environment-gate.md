# Host Environment Gate

Date: March 12, 2026

## Gate definition

The hosted environment used by the mobile shell is the final operational dependency for internal distribution and the primary technical blocker for public store production.

## Exact READY criteria

- final professional domain
- valid TLS certificate
- `GET /api/mobile/runtime` returns `200`
- `GET /api/health` returns `200`
- no redirect to temporary hosts
- reviewer access works
- privacy policy works
- terms work
- account deletion page works
- support path works
- auth/login/logout work on the hosted origin

## Current status

- build integration: READY
- shell validation: READY
- local config validation: READY
- external host validation: NOT VERIFIED

## Decision

- TestFlight controlled: READY
- Google Play internal testing: READY
- Public store production: NOT READY

## Why public production is still blocked

The repository can now generate and package a correct mobile wrapper, but it cannot prove from inside this environment that the hosted origin is externally reachable, stable, and reviewer-safe.
