# BlackBelt Store Submission Checklist

Date: 2026-03-13
Version: 1.0.0

## Canonical Mobile Build Convention

- Capacitor web assets live in `mobile-build/`
- `out/` is not part of the mobile release pipeline
- `CAPACITOR_BUILD=true pnpm build` is the canonical command to generate `mobile-build/`

## Required Commands

### Web build

```bash
pnpm build
```

### Mobile build for Capacitor

```bash
pnpm mobile:runtime:check
CAPACITOR_BUILD=true pnpm build
```

Expected artifacts:

- `mobile-build/index.html`
- `mobile-build/offline.html`
- `mobile-build/mobile-shell.json`

### Native sync

```bash
pnpm mobile:sync:ios
pnpm mobile:sync:android
```

Shortcuts:

```bash
pnpm mobile:build:web
pnpm mobile:sync
pnpm mobile:ios
pnpm mobile:android
```

## Native Packaging

### Android

```bash
cd android
./gradlew bundleRelease
```

Expected output:

- `android/app/build/outputs/bundle/release/app-release.aab`

### iOS

```bash
open ios/App/App.xcworkspace
```

Then archive in Xcode:

1. Select `Any iOS Device`
2. `Product -> Archive`
3. `Distribute App -> App Store Connect`

## Environment Requirements

At least one of these must exist and must be HTTPS:

- `CAPACITOR_SERVER_URL`
- `NEXT_PUBLIC_APP_URL`

Optional:

- `CAPACITOR_FALLBACK_URLS`
- `SUPPORT_EMAIL`
- `PRIVACY_EMAIL`

## Submission Checklist

- [ ] `pnpm build` passed
- [ ] `CAPACITOR_BUILD=true pnpm build` passed
- [ ] `npx cap sync ios` passed
- [ ] `npx cap sync android` passed
- [ ] Reviewer host is public, stable, and HTTPS
- [ ] `/api/mobile/runtime` returns 200 on the hosted origin
- [ ] `/api/health` returns 200 on the hosted origin
- [ ] `/review-access` is reachable
- [ ] `/suporte` is reachable
- [ ] `/politica-privacidade` is reachable
- [ ] `/termos-de-uso` is reachable
- [ ] `/excluir-conta` is reachable
- [ ] Reviewer login/logout works on the hosted origin
- [ ] In-app account menu exposes `Excluir conta`
- [ ] Settings `Minha Conta` exposes `Solicitar exclusão`
- [ ] Privacy policy references the in-app and web deletion paths
- [ ] Reviewer notes include login URL, support URL, privacy URL, terms URL, and deletion URL
- [ ] Google Play Data deletion form uses the public `/excluir-conta` URL
- [ ] Android signing is configured
- [ ] iOS signing/team configuration is configured
- [ ] Store metadata, screenshots, icons, and privacy disclosures are complete

## Release Notes

- The mobile app uses a hosted Capacitor shell strategy.
- The full Next.js product is not statically exported for native packaging.
- No release runbook should instruct operators to move API routes or generate `out/`.
