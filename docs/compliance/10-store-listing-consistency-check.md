# Store Listing Consistency Check

Date: March 12, 2026

## Consistent after this round

- privacy policy route exists and is publicly reachable in the app structure
- terms route exists and is publicly reachable in the app structure
- account deletion route exists and is publicly reachable in the app structure
- reviewer path exists via `/review-access`
- mobile wrapper now reflects a hosted web strategy instead of pretending to be a fully bundled static app

## Claims that must remain conservative

- native offline support
- native billing / restore purchases
- real-time hosted uptime guarantees
- advanced privacy guarantees not contractually approved

## Listing recommendation

Position BlackBelt as a managed mobile companion for a hosted platform, not as a fully offline-native mobile product.

## Remaining inconsistency risk

If the deployed review environment does not expose `/review-access` and mock reviewer login as documented, the store listing and the actual reviewer journey will diverge again.
