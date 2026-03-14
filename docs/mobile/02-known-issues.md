# Known Mobile Issues

## Resolved Technically

- Static export to `out/` is no longer the mobile strategy.
- `cap sync` is no longer blocked by missing `out/`; the current source of truth is `mobile-build/`.
- The repository can validate the hosted shell flow locally.

## Still Open

- `SUPPORT_EMAIL` may be unset in runtime validation.
- `PRIVACY_EMAIL` may be unset or reused from support.
- `CAPACITOR_FALLBACK_URLS` may still be empty, leaving single-host mode.
- Public distribution still depends on externally validated hosted runtime.

## Classification

- Local packaging/runtime path: `Resolvido tecnicamente`
- Controlled distribution: `Depende de configuração externa`
- Public store production: `Planejado`
