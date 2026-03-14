# Final Mobile Build Command

Date: March 12, 2026

## Single source of truth

Capacitor must consume `mobile-build/`.

## Definitive commands

Validate the hosted product first:

```bash
npx next build --webpack
```

Validate hosted web app and generate the Capacitor shell:

```bash
pnpm mobile:runtime:check
pnpm mobile:build:web
```

Sync both native projects:

```bash
npx cap sync
```

Sync only iOS:

```bash
npx cap sync ios
```

Sync only Android:

```bash
npx cap sync android
```

## Required environment

One of the following must exist and must be HTTPS:

- `CAPACITOR_SERVER_URL`
- `NEXT_PUBLIC_APP_URL`

## Release interpretation

- `pnpm build`: wrapper around the official webpack build path and optional mobile shell generation
- `npx next build --webpack`: explicit hosted release validation path
- `CAPACITOR_BUILD=true pnpm build`: validates the hosted app and generates `mobile-build/`
- `pnpm mobile:build:web`: convenience alias for the same mobile build flow
- `cap sync`: copies `mobile-build/` into native projects

No release process should depend on `out/` anymore.
