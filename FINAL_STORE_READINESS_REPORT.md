# Final Store Readiness Report

Date: 2026-03-13
Repository: `GregoryGSPinto/blackbelt`
Decision owner: CTO release audit

## Final Release Status

Current honest status: `READY FOR INTERNAL STORE TESTING`

Not yet honest to label as: `READY FOR FULL STORE SUBMISSION`

## Executive Summary

The repository is now structurally stable for internal mobile release validation:

- web build passes
- mobile Capacitor shell build passes
- iOS sync passes
- Android sync passes
- lint, tests, and typecheck pass
- reviewer/support/privacy/terms/account-deletion paths are aligned
- password recovery no longer pretends success without calling a real auth flow

The remaining blockers are mostly external release inputs or last-mile operational assets:

- final reviewer credentials on the production host
- final Apple/Google business identity fields
- final monitored support/privacy inbox configuration
- final production OAuth redirect validation
- final screenshot package for store upload
- Supabase authenticated dry-run against the target project requires `SUPABASE_ACCESS_TOKEN`

## Category Status

### 1. Build and Quality: PASS

- `pnpm install` passed
- `pnpm typecheck` passed
- `pnpm lint` passed
- `pnpm test` passed
- `pnpm build` passed

Notes:

- `pnpm typecheck` was stabilized to use `tsconfig.typecheck.json` so release validation no longer depends on volatile `.next/dev` type artifacts.
- Next.js still warns that `middleware` should migrate to `proxy`. This is a non-blocking modernization item, not a release blocker.

### 2. Mobile Release Readiness: PASS WITH WARNINGS

- `CAPACITOR_BUILD=true pnpm build` passed
- `pnpm mobile:sync:ios` passed
- `pnpm mobile:sync:android` passed
- canonical Capacitor asset directory is `mobile-build/`
- shell assets are copied into native projects correctly

Warnings:

- `SUPPORT_EMAIL` and `PRIVACY_EMAIL` are still unset in the local runtime check
- no fallback runtime URLs are configured
- iOS sync still warns that `capacitor-native-biometric` does not provide `Package.swift`, but sync completes successfully

### 3. Auth and Reviewer Path: PARTIAL

What is now good:

- login flow is covered by existing integration/component tests
- logout path is present in account menus
- account deletion is accessible in-app and on the web
- reviewer notes and reviewer help page are ready
- password recovery is no longer simulated

What still blocks full submission:

- final reviewer credentials still need to be provisioned on the hosted review environment
- production Apple/Google OAuth redirect validation still depends on final console credentials and hosted origin

### 4. Billing and Subscriptions: PARTIAL

What is good:

- Stripe webhook route exists and validates signatures
- pricing/subscription migration path is non-destructive in the audited migration set
- public legal/compliance narrative now references support and deletion consistently

What still needs explicit release-owner confirmation:

- the `assinatura` UI/service layer still supports mock-backed/fallback behavior in non-production paths
- final commercial narrative, subscription screenshots, and store metadata still require human verification against the live production configuration

### 5. Compliance: PARTIAL

What is good:

- privacy policy exists
- terms exist
- support page exists
- account deletion exists both in-app and on the web
- reviewer notes are prepared
- Apple privacy / Google data deletion narrative docs are prepared

What still blocks full submission:

- final legal entity, address, and publisher fields are still external inputs
- support/privacy monitored inboxes still need final production confirmation

### 6. Security: PASS WITH WARNINGS

What is good:

- `SUPABASE_SERVICE_ROLE_KEY` usage remains server-side in tracked code
- `.env.local` contains a local secret but it is not tracked by git
- webhook signature validation exists
- health/env routes expose booleans, not raw secrets

Warnings:

- local workspace still contains a real service-role secret in `.env.local`; this is acceptable only because it is ignored by git and must stay out of commits
- release owners should rotate any secret if they suspect prior local exposure

### 7. Database Rollout: PARTIAL

What is good:

- destructive `DROP TABLE` statements are no longer present in pending pricing migrations
- `00029_pricing_v3_0.sql` is additive/non-destructive in its current form
- backup strategy is documented in `DATABASE_BACKUP.md`

What still blocks final production promotion sign-off:

- `supabase db push --dry-run` against the real project could not be completed because this environment does not have `SUPABASE_ACCESS_TOKEN`
- this is an operational access blocker, not a repository code blocker

### 8. UX and Store Perception: PARTIAL

What is good:

- login transitions were previously stabilized
- account/support/legal/deletion surfaces are coherent and reviewer-friendly
- support URL mismatch in store metadata was corrected to `/suporte`

What still blocks full submission confidence:

- final screenshot assets are not present under `store/screenshots/`; only documentation files exist
- no device-level automated smoke run was executed inside a real iOS/Android simulator in this audit

## Problems Found and Corrections Applied

### Fixed in this final audit

1. Unstable `typecheck`
- Cause: `tsconfig.json` was affected by volatile `.next/dev/types`
- Fix: introduced `tsconfig.typecheck.json` and updated the `typecheck` script to use it

2. Password recovery flow was misleading
- Cause: `app/(auth)/esqueci-senha/page.tsx` used a `setTimeout` success simulation
- Fix: now calls `supabase.auth.resetPasswordForEmail(...)` when configured and fails honestly otherwise

3. Password change flow was misleading
- Cause: `app/(auth)/alterar-senha/page.tsx` simulated a password update
- Fix: now uses `supabase.auth.updateUser({ password })` and requires a valid recovery/session context

4. Store metadata support URL mismatch
- Cause: metadata still referenced `/support` while the canonical route is `/suporte`
- Fix: updated App Store and generic store metadata files to use `https://blackbelt.app/suporte`

5. Supabase CLI missing binary
- Cause: package postinstall did not run in this environment
- Fix: installed the CLI binary manually from the package postinstall workflow so database tooling could be inspected

## Validation Executed

### Commands run successfully

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
CAPACITOR_BUILD=true pnpm build
pnpm mobile:runtime:check
pnpm mobile:sync:ios
pnpm mobile:sync:android
node_modules/.pnpm/supabase@2.76.15/node_modules/supabase/bin/supabase --version
```

### Commands that did not complete for external reasons

```bash
node_modules/.pnpm/supabase@2.76.15/node_modules/supabase/bin/supabase db push --dry-run
```

Result:

- blocked by missing `SUPABASE_ACCESS_TOKEN` / Supabase login for the target project

## Remaining Risks

Short list of real remaining risks before full store submission:

- reviewer credentials still need to be provisioned on the public hosted environment
- store screenshots are not yet present as final upload-ready image assets
- legal entity, address, and publisher fields still need business-owner completion
- support/privacy monitored inboxes still need production confirmation
- Supabase production dry-run still needs authenticated execution
- production OAuth redirect URLs still need final console validation

## Release Checklists

### TestFlight

- [ ] `pnpm build` passed on release branch
- [ ] `CAPACITOR_BUILD=true pnpm build` passed
- [ ] `pnpm mobile:sync:ios` passed
- [ ] Xcode signing and team configured
- [ ] reviewer credentials provisioned on hosted origin
- [ ] `/suporte`, `/politica-privacidade`, `/termos-de-uso`, `/excluir-conta`, `/review-access` reachable
- [ ] screenshots exported and attached to release packet
- [ ] archive uploaded to TestFlight

### Play Internal Testing

- [ ] `CAPACITOR_BUILD=true pnpm build` passed
- [ ] `pnpm mobile:sync:android` passed
- [ ] release signing configured
- [ ] `android/app/build/outputs/bundle/release/app-release.aab` generated
- [ ] public deletion URL entered as `/excluir-conta`
- [ ] support/privacy/legal URLs validated on production host
- [ ] screenshots exported and attached to Play listing

### App Store Connect

- [ ] support URL set to `https://<official-domain>/suporte`
- [ ] privacy URL set to `https://<official-domain>/politica-privacidade`
- [ ] reviewer notes pasted from compliance pack
- [ ] seller legal entity and address filled
- [ ] support/privacy contacts filled
- [ ] screenshots uploaded
- [ ] reviewer credentials inserted
- [ ] Apple Sign In production configuration validated

### Play Console

- [ ] privacy policy URL set
- [ ] support contact email set
- [ ] data deletion URL set to `https://<official-domain>/excluir-conta`
- [ ] Data Safety answers pasted from compliance draft
- [ ] screenshots uploaded
- [ ] internal testers assigned

## Final Decision

### Internal store testing

`PASS`

The repository is in a credible state for TestFlight internal distribution and Play Internal Testing.

### Full production store submission

`PARTIAL / NOT YET`

The remaining blockers are not core repository failures anymore. They are:

- external store metadata/business inputs
- final screenshot asset package
- final hosted reviewer environment validation
- authenticated Supabase production dry-run
