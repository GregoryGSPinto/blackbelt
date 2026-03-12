# Public Store Go No-Go

Date: March 12, 2026

## Status by channel

- Web production limitada: GO WITH CONDITIONS
- Cliente piloto: GO
- Google Play internal testing: GO
- Google Play production: NO-GO
- App Store TestFlight: GO
- App Store production: NO-GO
- Rollout comercial amplo: NO-GO

## Critical blockers

1. Hosted runtime not externally validated
2. Legal entity and contact fields not finalized
3. Console privacy/data safety forms not finalized by the company
4. Native signing and submission remain external operational steps

## Moderate blockers

1. No fallback host configured
2. Support and privacy emails still absent from env-backed runtime metadata

## Recommendations only

1. Add approved fallback domain
2. Add uptime monitoring and external synthetic checks

## Post-launch

1. Improve resilience of hosted mobile runtime
2. Consider second production-grade host for disaster recovery
