# Store Submission Validation

Date: 2026-03-08

## Status Summary

- Build status: FAIL
- Auth validation: PASS
- Stripe validation: PASS
- Security validation: PASS
- Mobile build: FAIL
- UX validation: FAIL
- Compliance validation: FAIL

## What Passed

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm test` passed: 37 files, 574 tests passed, 1 skipped.
- `pnpm build` passed for the web/server deployment path.
- Supabase cookie-session auth is now the active route auth pattern in the touched subscription, pricing, usage, admin, and profile endpoints.
- Placeholder API endpoints reviewed in this pass now return `501 Not Implemented` instead of fake success payloads.
- Stripe webhook verification is present in [app/api/webhooks/stripe/route.ts](/Users/user_pc/Projetos/BlackBelt/app/api/webhooks/stripe/route.ts) through `stripe.webhooks.constructEvent(...)`.
- No live Stripe secret literals or JWT-like secrets were found in `app/`, `components/`, or `lib/`.
- `SUPABASE_SERVICE_ROLE_KEY` usage reviewed in `app/api`; touched usages are server-side only and now marked with a security warning comment.
- Store metadata, icons, screenshots, and iOS privacy manifest files exist in the repository.

## Critical Blocking Issues

1. Capacitor release build is not producing a static web asset directory for native packaging.
   - `npx cap sync ios` fails: `Could not find the web assets directory: ./out`
   - `npx cap sync android` fails with the same error.
   - The repo's own native build path (`bash scripts/build-capacitor.sh`) now completes the Next build, but still does not generate `out/`.
   - Result: the iOS and Android native shells cannot be updated from the current release build flow.

2. Pending Supabase migrations contain destructive table drops.
   - `pnpm exec supabase db push --dry-run` reported pending migrations including `supabase/migrations/00029_pricing_v3_0.sql`.
   - That migration includes `DROP TABLE IF EXISTS` statements for billing/subscription tables such as `trial_tracking`, `subscription_addons`, `usage_quotas`, `academy_subscriptions`, and `subscription_plans`.
   - Result: production database rollout is not safe without a backup/migration plan.

## Auth Validation

- Legacy bearer-token auth was removed from the touched browser fetch flows and corresponding routes now rely on Supabase cookie sessions.
- No bearer-token auth pattern remains in `app/` or `components/` production code.
- Limitation: I did not perform a live credential login/logout test with `admin@blackbelt.com / blackbelt123` in this environment.

## Stripe Validation

- Webhook signature verification exists.
- No hardcoded Stripe secret keys were found in production source.
- Limitation: I did not execute a live Stripe CLI webhook replay or a full test-card checkout from this environment.

## Security Validation

- No client-side `SUPABASE_SERVICE_ROLE_KEY` exposure found.
- No committed live secrets detected in the scanned production source paths.
- Placeholder success responses in key placeholder routes were converted to explicit `501` responses.

## Mobile Build Validation

- `pnpm build` succeeds for the web runtime.
- `CAPACITOR_BUILD=true pnpm build` succeeds after removing the Google font network dependency in the root layout.
- Native packaging still fails because the expected Capacitor asset directory `out/` is not generated.
- `bash scripts/build-capacitor.sh` and `scripts/build-native.sh` were updated to use Webpack for native-release builds, but the missing `out/` issue remains.

## UX / Compliance Validation Limits

- I could verify presence of login, privacy policy page, terms page, screenshots, icons, and account-deletion route in code.
- I could not validate real-device behavior, App Store Connect settings, Play Console content rating, privacy-policy URL availability over the public internet, or Xcode/Android Studio archive builds from this environment.

## Files Changed In This Validation Pass

- `app/layout.tsx`
- `app/api/feedback/nps/route.ts`
- `app/dashboard/admin/plano/page.tsx`
- `app/(super-admin)/super-admin/academias/page.tsx`
- `components/subscription/SubscriptionCard.tsx`
- `components/subscription/UsageQuotas.tsx`
- `app/(auth)/esqueci-senha/page.tsx`
- `app/api/professor/videos/[id]/route.ts`
- `tests/components/login.test.tsx`
- `tests/integration/login-flow.test.ts`
- `scripts/build-capacitor.sh`
- `scripts/build-native.sh`

## Final Decision

🔴 NOT READY FOR STORE SUBMISSION

Blocking issues:

1. Capacitor release packaging is broken because no `out/` web asset directory is generated, so `cap sync` fails for both iOS and Android.
2. Pending Supabase migrations include destructive `DROP TABLE` operations against subscription/billing tables and are not safe to promote as-is.
