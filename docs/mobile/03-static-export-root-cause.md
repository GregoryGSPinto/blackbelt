# Static Export Root Cause

Date: March 12, 2026

## Objective root cause

The previous mobile pipeline assumed the full BlackBelt web application could be shipped as a static export for Capacitor. That assumption was wrong for this repository.

The application is a server-backed Next.js 16 App Router product with:

- auth and session flows backed by server behavior
- middleware
- many route handlers under `app/api/*`
- dynamic role-based navigation
- server-dependent pages and health checks

Forcing `output: 'export'` for the whole product created an unstable build path. The observed `ENOENT .next/browser/default-stylesheet.css` was a symptom of that invalid export strategy, amplified by a brittle client-side style injection pattern in `components/layout/LayoutWrapper.tsx`.

## Technical contributors

1. `package.json` forced mobile build through `next build --webpack` under `CAPACITOR_BUILD=true`.
2. Next 16 expected browser build artifacts that were not produced consistently in that path.
3. `components/layout/LayoutWrapper.tsx` injected styles into `document.head` at module scope, which is unsafe during build/render pipelines.
4. `app/layout.tsx` loaded optional analytics and review-irrelevant client integrations in the root shell, increasing mobile export fragility.
5. Even after the crash was removed, full static export still did not produce a valid `out/` for Capacitor because the architecture is not static-export compatible.

## Final architectural decision

The mobile wrapper now uses a dedicated Capacitor shell instead of attempting to statically export the entire app.

Final approach:

- production web app remains a hosted Next.js deployment
- `pnpm build:mobile` validates the hosted web app with `pnpm build`
- a deterministic static shell is generated into `mobile-build/`
- Capacitor copies only `mobile-build/`
- the shell checks connectivity and opens the hosted HTTPS app

## Why this is the correct fix

- It removes the invalid assumption that the whole product is static-exportable.
- It gives Capacitor one stable `webDir`.
- It preserves the existing server-backed product behavior.
- It makes `cap sync ios` and `cap sync android` deterministic again.
- It is less risky than rewriting large portions of the app to fake static compatibility.

## Residual limitation

The mobile app is now dependent on the hosted HTTPS environment configured by `NEXT_PUBLIC_APP_URL` or `CAPACITOR_SERVER_URL`. Store readiness therefore depends on external availability of that environment, not on local asset generation.
