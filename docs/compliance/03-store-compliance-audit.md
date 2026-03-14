# Store Compliance Audit

Date: March 13, 2026

## Current blockers App Store

- Final legal entity and business address are still external inputs
- Final monitored support/privacy inboxes still need production confirmation
- Production reviewer credentials still need to be inserted into the submission packet
- Production Apple Sign In redirect configuration still needs final hosted-origin validation

## Current blockers Google Play

- Final production domain must be live for support, privacy, terms, and deletion URLs
- Final processor list and Data Safety answers still need business confirmation

## Risks removed in this pass

- Account deletion is now exposed inside the app via account menu and settings
- Public account deletion URL is canonical and documented for Play Console
- Support, privacy, terms, and reviewer paths are aligned in code and docs
- Stale `.html` legal links were removed from active product flows

## Warnings

- Historical docs still contain superseded examples and should not be used as release source of truth
- OAuth production readiness still depends on console credentials and final redirect URIs

## Publicability score

8/10

## Decision

READY FOR HUMAN STORE SUBMISSION REVIEW, PENDING EXTERNAL BUSINESS AND CONSOLE INPUTS
